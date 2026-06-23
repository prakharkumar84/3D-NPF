const codeGenPrompts = [
  {
    id: "dal-development",
    title: "DAL Development",
    prompt: "Create DAL for customer table with object hooks for validation, field dependencies for address fields, and business methods for credit limit checking.",
    code: `|******************************************************************************
|* DAL for Customer Table (tccom100) - Complete Implementation
|* Using proper DAL2 patterns from DAL_Complete_Guide.md
|******************************************************************************

#include <bic_dal2>

|=== OBJECT HOOKS ===

|Set default values for new customer
function extern long set.object.defaults()
{
    tccom100.stat = tccom.stat.active
    tccom100.cdat = utc.num()
    tccom100.crtm = tccom.crtm.net30
    tccom100.ccur = tccom.ccur.usd
    
    return(0)
}

|Before creating new customer object
function extern long before.new.object()
{
    |Initialize audit fields
    tccom100.logn = logname\$()
    tccom100.cdat = utc.num()
    
    return(0)
}

|Before saving customer object
function extern long before.save.object(long mode)
{
    |Validate mandatory fields
    if isspace(tccom100.bpid) then
        dal.set.error.message("Customer code is required")
        return(DALHOOKERROR)
    endif
    
    if isspace(tccom100.nama) then
        dal.set.error.message("Customer name is required")
        return(DALHOOKERROR)
    endif
    
    |Check for duplicate customer code on new records
    if mode = DAL_NEW then
        select tccom100.bpid
        from   tccom100
        where  tccom100.bpid = {:tccom100.bpid}
        selectdo
            dal.set.error.message("Customer code already exists: " & tccom100.bpid)
            return(DALHOOKERROR)
        endselect
    endif
    
    |Update modification timestamp
    tccom100.ldat = utc.num()
    tccom100.llogn = logname\$()
    
    return(0)
}

|Before deleting customer
function extern long before.destroy.object()
{
    |Check if customer has open orders
    select tdsls400.orno
    from   tdsls400
    where  tdsls400.ofbp = {:tccom100.bpid}
    and    tdsls400.hdst in (tdsls.hdst.free, tdsls.hdst.approved)
    selectdo
        dal.set.error.message("Cannot delete customer with open orders")
        return(DALHOOKERROR)
    endselect
    
    |Check outstanding balance
    if tccom100.obal <> 0 then
        dal.set.error.message("Cannot delete customer with outstanding balance")
        return(DALHOOKERROR)
    endif
    
    return(0)
}

|=== FIELD HOOKS ===

|Customer type field validation
function extern boolean tccom100.bpty.is.valid()
{
    on case tccom100.bpty
    case tccom.bpty.customer:
    case tccom.bpty.supplier:
    case tccom.bpty.both:
        return(true)
    default:
        dal.set.error.message("Invalid customer type selected")
        return(false)
    endcase
}

|Credit limit field validation
function extern boolean tccom100.crlm.is.valid()
{
    |Credit limit must be positive
    if tccom100.crlm < 0 then
        dal.set.error.message("Credit limit cannot be negative")
        return(false)
    endif
    
    return(true)
}

|Customer status field validation
function extern boolean tccom100.stat.is.valid()
{
    on case tccom100.stat
    case tccom.stat.active:
    case tccom.stat.inactive:
    case tccom.stat.blocked:
        return(true)
    default:
        dal.set.error.message("Invalid customer status")
        return(false)
    endcase
}

|Payment terms validation
function extern boolean tccom100.crtm.is.valid()
{
    |Check if payment terms exist in reference table
    select tcmcs100.crtm
    from   tcmcs100
    where  tcmcs100.crtm = {:tccom100.crtm}
    selectdo
        |Check if payment terms are active
        if tcmcs100.stat <> tcmcs.stat.active then
            dal.set.error.message("Payment terms are not active")
            return(false)
        endif
    selectempty
        dal.set.error.message("Payment terms not found")
        return(false)
    endselect
    
    return(true)
}

|Country code validation
function extern boolean tccom100.ccty.is.valid()
{
    |Validate country code exists
    select tcmcs013.ccty
    from   tcmcs013
    where  tcmcs013.ccty = {:tccom100.ccty}
    selectdo
        return(true)
    selectempty
        dal.set.error.message("Invalid country code")
        return(false)
    endselect
}

|State field applicability based on country
function extern boolean tccom100.stat.is.applicable()
{
    |State field only applicable for certain countries
    on case tccom100.ccty
    case "US":
    case "CA":
    case "AU":
        return(true)
    default:
        return(false)
    endcase
}

|Postal code format validation
function extern boolean tccom100.pstc.is.valid()
{
    |Validate postal code format based on country
    on case tccom100.ccty
    case "US":
        |US ZIP code format (5 digits or 5+4)
        if not match.pattern(tccom100.pstc, "^[0-9]{5}(-[0-9]{4})?\$") then
            dal.set.error.message("Invalid US ZIP code format")
            return(false)
        endif
        break
    case "CA":
        |Canadian postal code format
        if not match.pattern(tccom100.pstc, "^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]\$") then
            dal.set.error.message("Invalid Canadian postal code format")
            return(false)
        endif
        break
    default:
        |Basic validation for other countries
        if len(tccom100.pstc) > 10 then
            dal.set.error.message("Postal code too long")
            return(false)
        endif
    endcase
    
    return(true)
}

|=== FIELD DEPENDENCIES ===

function extern long before.open.object.set()
{
    |Setup field dependencies
    define.field.dependencies()
    return(0)
}

function define.field.dependencies()
{
    |Country affects state field visibility
    dal.field.depends.on(
        "tccom100.stat",
        HOOK_IS_APPLICABLE,
        "tccom100.ccty"
    )
    
    |Country affects postal code validation
    dal.field.depends.on(
        "tccom100.pstc",
        HOOK_IS_VALID,
        "tccom100.ccty"
    )
    
    |Customer type affects certain fields
    dal.field.depends.on(
        "tccom100.crlm",
        HOOK_IS_APPLICABLE,
        "tccom100.bpty"
    )
}

|=== BUSINESS METHODS ===

|Check if customer can place orders
function long tccom100.can.place.orders()
{
    domain tcamnt01 l.current.balance
    long l.ret
    
    |Check if customer is active
    if tccom100.stat <> tccom.stat.active then
        dal.set.error.message("Customer is not active")
        return(-12)
    endif
    
    |Get current balance
    l.ret = get.customer.balance(tccom100.bpid, l.current.balance)
    if l.ret <> 0 then
        dal.set.error.message("Unable to retrieve customer balance")
        return(-12)
    endif
    
    |Check credit limit
    if l.current.balance > tccom100.crlm then
        dal.set.error.message("Customer has exceeded credit limit")
        return(-12)
    endif
    
    return(0)
}

|Helper method to check if orders are allowed
function boolean tccom100.can.place.orders.is.allowed()
{
    long l.ret
    
    l.ret = tccom100.can.place.orders()
    return(l.ret = 0)
}

|Calculate customer credit available
function long tccom100.get.credit.available(
    ref domain tcamnt01 o.available.credit
)
{
    domain tcamnt01 l.current.balance
    long l.ret
    
    |Initialize output
    o.available.credit = 0
    
    |Get current balance
    l.ret = get.customer.balance(tccom100.bpid, l.current.balance)
    if l.ret <> 0 then
        return(-12)
    endif
    
    |Calculate available credit
    o.available.credit = tccom100.crlm - l.current.balance
    if o.available.credit < 0 then
        o.available.credit = 0
    endif
    
    return(0)
}

|Helper function to get customer balance
function long get.customer.balance(
    domain tccom.bpid i.customer.code,
    ref domain tcamnt01 o.balance
)
{
    |Initialize balance
    o.balance = 0
    
    |Sum outstanding invoices
    select sum(tcisn100.oamt)
    from   tcisn100
    where  tcisn100.ofbp = {:i.customer.code}
    and    tcisn100.stat = tcisn.stat.open
    selectdo
        o.balance = sum(tcisn100.oamt)
    endselect
    
    return(0)
}`,
  },
  {
    id: "3gl-scripts",
    title: "3GL Scripts",
    prompt: "Give 3GL script for batch processing of sales orders. Include process startup, wait for completion, error handling.",
    code: `|******************************************************************************
|* txsls.batch.processing.bc  Version 1.0
|* Sales Order Batch Processing Script
|* Author: Amazon Q | Date: 2024
|******************************************************************************
|* Script Type: 0 - Batch Processing
|******************************************************************************

#include <bic_dam>
#include <bic_text>
#pragma used dll "libutil"

table ttdsls400
table ttccom100

|* Global variables
string g.process.status(20) based
string g.error.log(256) based
string g.notification.email(100) based
long g.processed.count based
long g.error.count based
long g.start.time based

function main()
{
    functionusage
        Desc:   Batch processing of sales orders with error handling
        Input:  argv\$(1) - email for notifications
                argv\$(2) - process timeout in seconds
        Return: 0 = success, 1 = error
    endfunctionusage
    
    |* Variable declarations
    long l.ret
    long l.timeout
    long l.child.pid
    string l.command(500)
    string l.log.message(512)
    
    |* Initialize variables
    g.process.status = "INITIALIZING"
    g.processed.count = 0
    g.error.count = 0
    g.start.time = utc.num()
    
    |* Read command line arguments
    g.notification.email = argv\$(1)
    l.timeout = lval(argv\$(2))
    
    |* Set defaults if not provided
    if isspace(g.notification.email) then
        g.notification.email = "admin@company.com"
    endif
    
    if l.timeout <= 0 then
        l.timeout = 3600  |* Default 1 hour
    endif
    
    |* Create error log file
    g.error.log = bse.tmp.dir\$() & "batch_errors_" & string(g.start.time) & ".log"
    
    |* Log batch start
    l.log.message = "Batch processing started at: " & string(g.start.time)
    write.to.log(l.log.message)
    
    |* Start main processing program
    l.command = "txsls.process.orders"
    l.child.pid = activate(l.command)
    
    if l.child.pid <= 0 then
        g.process.status = "FAILED"
        l.log.message = "ERROR: Failed to start sales order processing program"
        write.to.log(l.log.message)
        send.error.notification("Failed to start batch processing")
        end(1)
    endif
    
    g.process.status = "PROCESSING"
    l.log.message = "Sales order processing program started successfully (PID: " & string(l.child.pid) & ")"
    write.to.log(l.log.message)
    
    |* Wait for completion with timeout
    l.ret = wait.and.activate(l.child.pid, l.timeout)
    
    on case l.ret
    case 0:
        |* Process completed successfully
        g.process.status = "COMPLETED"
        l.log.message = "Batch processing completed successfully"
        write.to.log(l.log.message)
        
        |* Get processing statistics
        get.processing.statistics()
        
        |* Start post-processing
        start.post.processing()
        
        |* Send success notification
        send.success.notification()
        break
        
    case 1:
        |* Process failed
        g.process.status = "ERROR"
        l.log.message = "ERROR: Batch processing failed"
        write.to.log(l.log.message)
        send.error.notification("Batch processing failed")
        break
        
    case 2:
        |* Process timed out
        g.process.status = "TIMEOUT"
        l.log.message = "ERROR: Batch processing timed out after " & string(l.timeout) & " seconds"
        write.to.log(l.log.message)
        
        |* Try to terminate the process
        terminate.process(l.child.pid)
        
        send.error.notification("Batch processing timed out")
        break
        
    default:
        |* Unknown error
        g.process.status = "UNKNOWN_ERROR"
        l.log.message = "ERROR: Unknown error occurred (return code: " & string(l.ret) & ")"
        write.to.log(l.log.message)
        send.error.notification("Unknown error in batch processing")
    endcase
    
    |* Cleanup and exit
    cleanup.resources()
    
    |* Final log entry
    l.log.message = "Batch processing script completed at: " & string(utc.num())
    write.to.log(l.log.message)
    l.log.message = "Final status: " & g.process.status
    write.to.log(l.log.message)
    
    if g.process.status = "COMPLETED" then
        end(0)
    else
        end(1)
    endif
}

function write.to.log(string i.message(512))
{
    |* Write timestamped message to log file
    long l.fp
    string l.timestamp(20)
    string l.full.message(600)
    
    l.timestamp = string(utc.num())
    l.full.message = l.timestamp & ": " & i.message
    
    l.fp = seq.open(g.error.log, "a")
    if l.fp > 0 then
        seq.puts(l.full.message, l.fp)
        seq.close(l.fp)
    endif
}

function get.processing.statistics()
{
    |* Get processing statistics from completed process
    |* This would typically read from a status file or database
    
    string l.status.file(256)
    long l.fp
    string l.line(100)
    
    l.status.file = bse.tmp.dir\$() & "process_status.txt"
    
    l.fp = seq.open(l.status.file, "r")
    if l.fp > 0 then
        |* Read processed count
        if seq.gets(l.line, l.fp) > 0 then
            g.processed.count = lval(l.line)
        endif
        
        |* Read error count
        if seq.gets(l.line, l.fp) > 0 then
            g.error.count = lval(l.line)
        endif
        
        seq.close(l.fp)
    endif
    
    write.to.log("Orders processed: " & string(g.processed.count))
    write.to.log("Errors encountered: " & string(g.error.count))
}

function start.post.processing()
{
    |* Start post-processing tasks
    long l.child.pid
    long l.ret
    string l.command(200)
    
    l.command = "txsls.post.process"
    l.child.pid = activate(l.command)
    
    if l.child.pid > 0 then
        write.to.log("Post-processing started (PID: " & string(l.child.pid) & ")")
        
        |* Wait for post-processing (10 minutes timeout)
        l.ret = wait.and.activate(l.child.pid, 600)
        
        if l.ret = 0 then
            write.to.log("Post-processing completed successfully")
        else
            write.to.log("WARNING: Post-processing failed or timed out")
        endif
    else
        write.to.log("WARNING: Failed to start post-processing")
    endif
}

function send.success.notification()
{
    |* Send success notification email
    long l.child.pid
    string l.command(1000)
    string l.subject(100)
    string l.message(500)
    long l.duration
    
    l.duration = utc.num() - g.start.time
    
    l.subject = "Batch Processing Completed Successfully"
    l.message = "Sales order batch processing completed.\n" &
               "Orders processed: " & string(g.processed.count) & "\n" &
               "Errors: " & string(g.error.count) & "\n" &
               "Duration: " & string(l.duration) & " seconds"
    
    l.command = "email.sender \"" & g.notification.email & "\" \"" & l.subject & "\" \"" & l.message & "\""
    
    l.child.pid = activate(l.command)
    if l.child.pid > 0 then
        write.to.log("Success notification sent to: " & g.notification.email)
    else
        write.to.log("WARNING: Failed to send success notification")
    endif
}

function send.error.notification(string i.error.type(100))
{
    |* Send error notification email
    long l.child.pid
    string l.command(1000)
    string l.subject(100)
    string l.message(500)
    
    l.subject = "Batch Processing Failed"
    l.message = "Sales order batch processing failed.\n" &
               "Error type: " & i.error.type & "\n" &
               "Status: " & g.process.status & "\n" &
               "Error log: " & g.error.log & "\n" &
               "Manual intervention required."
    
    l.command = "email.sender \"" & g.notification.email & "\" \"" & l.subject & "\" \"" & l.message & "\""
    
    l.child.pid = activate(l.command)
    if l.child.pid > 0 then
        write.to.log("Error notification sent to: " & g.notification.email)
    else
        write.to.log("CRITICAL: Failed to send error notification")
    endif
}

function terminate.process(long i.pid)
{
    |* Attempt to terminate a running process
    long l.ret
    
    if i.pid > 0 then
        l.ret = kill.process(i.pid)
        if l.ret = 0 then
            write.to.log("Process " & string(i.pid) & " terminated successfully")
        else
            write.to.log("WARNING: Failed to terminate process " & string(i.pid))
        endif
    endif
}

function cleanup.resources()
{
    |* Cleanup any allocated resources
    
    |* Free global memory if allocated
    if allocated(g.process.status) then
        free.mem(g.process.status)
    endif
    
    if allocated(g.error.log) then
        free.mem(g.error.log)
    endif
    
    if allocated(g.notification.email) then
        free.mem(g.notification.email)
    endif
    
    write.to.log("Resources cleaned up successfully")
}

|* End of 3GL Script`,
  },
  {
    id: "dll-development",
    title: "DLL Development",
    prompt: "Create a DLL function for REST API integration that handles OAuth2 authentication, makes HTTP requests, and processes JSON.",
    code: `|******************************************************************************
|* REST API Integration DLL - OAuth2 Authentication
|* Using proper DLL creation patterns from dll-creation-rules.md
|******************************************************************************

#pragma used dll "libhttp"
#pragma used dll "libjson"

|DLL function for REST API integration with OAuth2
function extern long txapi.dll0001.rest.integration(
	domain	tcmcs.str256m	i.endpoint.url,
	domain	tcmcs.str256m	i.client.id,
	domain	tcmcs.str256m	i.client.secret,
	domain	tcmcs.str999m	i.request.body,
	ref	domain	tcmcs.str999m	o.response.data,
	ref	domain	tcmcs.str999m	o.error
)
{
DllUsage
	Expl:	REST API integration with OAuth2 authentication
	Pre:	Valid endpoint URL and OAuth2 credentials required
	Post:	HTTP request executed, response data populated
	Input:	i.endpoint.url - Target REST API endpoint
		i.client.id - OAuth2 client identifier
		i.client.secret - OAuth2 client secret
		i.request.body - JSON request payload
	Output:	o.response.data - API response body
		o.error - Error message if operation fails
	Return:	long - 0 = success, -12 = error
EndDllUsage

	long l.ret
	long l.oauth.params
	long l.header.list
	string l.access.token(512)
	string l.response.body(9999)
	
	tt.init.vars(
		l.ret,
		l.oauth.params,
		l.header.list,
		l.access.token,
		l.response.body,
		o.response.data,
		o.error
	)
	
	|Validate input parameters
	if isspace(i.endpoint.url) then
		o.error = "Endpoint URL is required"
		return(-12)
	endif
	
	if isspace(i.client.id) or isspace(i.client.secret) then
		o.error = "OAuth2 credentials are required"
		return(-12)
	endif
	
	|Setup OAuth2 authentication
	l.oauth.params = http.oauth2params.new()
	http.oauth2params.set.client.credentials(
		l.oauth.params,
		i.client.id,
		i.client.secret
	)
	
	|Get access token
	l.ret = http.oauth2.get.token(
		l.oauth.params,
		l.access.token
	)
	if l.ret <> 0 then
		o.error = "Failed to obtain OAuth2 token"
		http.oauth2params.destroy(l.oauth.params)
		return(-12)
	endif
	
	|Setup HTTP headers
	l.header.list = http.headerlist.new()
	http.headerlist.add(
		l.header.list,
		"Authorization",
		"Bearer " & l.access.token
	)
	http.headerlist.add(
		l.header.list,
		"Content-Type",
		"application/json"
	)
	
	|Make HTTP POST request
	l.ret = http.post(
		i.endpoint.url,
		HTTP_HEADERLIST,
		l.header.list,
		HTTP_REQUESTBODYSTRING,
		i.request.body,
		HTTP_RESPONSEBODYSTRING,
		l.response.body,
		HTTP_VERIFYPEER,
		false
	)
	
	if l.ret <> 0 then
		o.error = "HTTP request failed with code: " & str\$(l.ret)
	else
		o.response.data = l.response.body
	endif
	
	|Cleanup resources
	http.headerlist.destroy(l.header.list)
	http.oauth2params.destroy(l.oauth.params)
	
	return(l.ret)
}

|DLL function for JSON processing
function extern long txapi.dll0001.process.json(
	domain	tcmcs.str999m	i.json.input,
	domain	tcmcs.str100m	i.field.name,
	ref	domain	tcmcs.str256m	o.field.value,
	ref	domain	tcmcs.str999m	o.error
)
{
DllUsage
	Expl:	Extract field value from JSON response
	Pre:	Valid JSON string and field name required
	Post:	Field value extracted and returned
	Input:	i.json.input - JSON string to parse
		i.field.name - Name of field to extract
	Output:	o.field.value - Extracted field value
		o.error - Error message if parsing fails
	Return:	long - 0 = success, -12 = error
EndDllUsage

	long l.ret
	long l.json.object
	string l.temp.value(512)
	
	tt.init.vars(
		l.ret,
		l.json.object,
		l.temp.value,
		o.field.value,
		o.error
	)
	
	|Validate input
	if isspace(i.json.input) then
		o.error = "JSON input is required"
		return(-12)
	endif
	
	if isspace(i.field.name) then
		o.error = "Field name is required"
		return(-12)
	endif
	
	|Parse JSON
	l.json.object = Json.parseFromString(i.json.input)
	if l.json.object = 0 then
		o.error = "Invalid JSON format"
		return(-12)
	endif
	
	|Extract field value
	l.ret = Json.getString(
		l.json.object,
		i.field.name,
		l.temp.value
	)
	
	if l.ret = 0 then
		o.field.value = l.temp.value
	else
		o.error = "Field not found: " & i.field.name
		Json.destroy(l.json.object)
		return(-12)
	endif
	
	|Cleanup JSON object
	Json.destroy(l.json.object)
	
	return(0)
}

|DLL function for OData entity operations
function extern long txapi.dll0001.odata.entity(
	domain	tcmcs.str100m	i.entity.name,
	domain	tcmcs.str20m	i.operation,
	domain	tcmcs.str999m	i.entity.data,
	ref	domain	tcmcs.str999m	o.result.json,
	ref	domain	tcmcs.str999m	o.error
)
{
DllUsage
	Expl:	OData entity CRUD operations with JSON response
	Pre:	Valid entity name, operation type, and data required
	Post:	Entity operation executed, JSON result returned
	Input:	i.entity.name - OData entity name
		i.operation - CRUD operation (CREATE, READ, UPDATE, DELETE)
		i.entity.data - Entity data in JSON format
	Output:	o.result.json - Operation result in JSON format
		o.error - Error message if operation fails
	Return:	long - 0 = success, -12 = error
EndDllUsage

	long l.ret
	long l.json.response
	string l.table.name(20)
	
	tt.init.vars(
		l.ret,
		l.json.response,
		l.table.name,
		o.result.json,
		o.error
	)
	
	|Validate parameters
	if isspace(i.entity.name) then
		o.error = "Entity name is required"
		return(-12)
	endif
	
	if isspace(i.operation) then
		o.error = "Operation type is required"
		return(-12)
	endif
	
	|Map entity to table name
	l.table.name = "tc" & lower.case\$(i.entity.name)
	
	|Execute operation based on type
	on case upper.case\$(i.operation)
	case "CREATE":
		l.ret = create.entity.record(
			l.table.name,
			i.entity.data,
			o.result.json,
			o.error
		)
		break
		
	case "READ":
		l.ret = read.entity.record(
			l.table.name,
			i.entity.data,
			o.result.json,
			o.error
		)
		break
		
	case "UPDATE":
		l.ret = update.entity.record(
			l.table.name,
			i.entity.data,
			o.result.json,
			o.error
		)
		break
		
	case "DELETE":
		l.ret = delete.entity.record(
			l.table.name,
			i.entity.data,
			o.result.json,
			o.error
		)
		break
		
	default:
		o.error = "Invalid operation type: " & i.operation
		return(-12)
	endcase
	
	return(l.ret)
}

|Helper function for entity creation
function long create.entity.record(
	domain	tcmcs.str20m	i.table.name,
	domain	tcmcs.str999m	i.json.data,
	ref	domain	tcmcs.str999m	o.result.json,
	ref	domain	tcmcs.str999m	o.error
)
{
	long l.ret
	long l.json.input
	
	tt.init.vars(
		l.ret,
		l.json.input,
		o.result.json,
		o.error
	)
	
	|Parse input JSON
	l.json.input = Json.parseFromString(i.json.data)
	if l.json.input = 0 then
		o.error = "Invalid JSON data format"
		return(-12)
	endif
	
	|Create new record using DAL
	if dal.new.object(i.table.name) = 0 then
		|Set field values from JSON
		l.ret = set.fields.from.json(
			i.table.name,
			l.json.input,
			o.error
		)
		
		if l.ret = 0 then
			|Save the record
			l.ret = dal.save.object(i.table.name)
			if l.ret <> 0 then
				get.dal.all.messages(o.error)
				Json.destroy(l.json.input)
				return(-12)
			endif
			
			|Generate success response
			o.result.json = "{\"status\":\"success\",\"message\":\"Record created\"}"
		else
			Json.destroy(l.json.input)
			return(-12)
		endif
	else
		get.dal.all.messages(o.error)
		Json.destroy(l.json.input)
		return(-12)
	endif
	
	Json.destroy(l.json.input)
	return(0)
}`,
  },
  {
    id: "extensions-development",
    title: "Extensions Development",
    prompt: "Give BOD extension code for adding custom fields to sales order BOD. Include customer priority level and special instructions.",
    code: `| BOD Extension: Sales Order Custom Fields
| Using correct BOD Extension macros from BOD_Extension_Development_Guide.md

|Variable declarations inside case and if statements (MANDATORY l. prefix)
long l.retl
long l.header.xml
domain tcorno l.order.number
string l.customer.priority(10)
string l.special.instructions(256)
string l.delivery.preference(50)
domain tcyesno l.rush.order

tt.init.vars(
	l.retl,
	l.header.xml,
	l.order.number,
	l.customer.priority,
	l.special.instructions,
	l.delivery.preference,
	l.rush.order
)

|Get component identifiers using correct function
l.retl = getTableIdentifiers.SalesOrderBOD(l.header.xml)

|Extract order number from identifier structure
l.order.number = getIdentifierValueFromIdentifierStructure(
	l.header.xml,
	"tdsls400",
	"orno"
)

|Query sales order data
select tdsls400.ofbp,
       tdsls400.rem1,
       tdsls400.dlvm,
       tdsls400.rush
from   tdsls400
where  tdsls400._index1 = {:l.order.number}
selectdo
	|Get customer priority from customer master
	select tccom100.prty
	from   tccom100
	where  tccom100._index1 = {:tdsls400.ofbp}
	selectdo
		l.customer.priority = enum.descr\$(tccom100.prty)
	selectempty
		l.customer.priority = "Standard"
	endselect
	
	|Extract special instructions
	l.special.instructions = tdsls400.rem1
	
	|Get delivery preference description
	l.delivery.preference = enum.descr\$(tdsls400.dlvm)
	
	|Get rush order flag
	l.rush.order = tdsls400.rush
	
	|Add custom fields to UserArea using correct macros
	addValue("CustomerPriority", l.customer.priority, "String")
	
	if not isspace(l.special.instructions) then
		addValue("SpecialInstructions", l.special.instructions, "String")
	endif
	
	if not isspace(l.delivery.preference) then
		addCodeValue("DeliveryPreference", l.delivery.preference, "DLVM", "")
	endif
	
	|Add enum field using MANDATORY pattern
	addValue("RushOrder", rdi.etoc\$("tcyesno", etol(l.rush.order)), "String")
	
	|Add calculated field
	if l.rush.order = tcyesno.yes then
		addValue("ProcessingPriority", "HIGH", "String")
	else
		addValue("ProcessingPriority", "NORMAL", "String")
	endif
	
	|Add timestamp
	addValue("ExtensionTimestamp", string(utc.num()), "String")
endselect

| Session Extension: Customer Priority Field
| Extension Type: Calculated Field

|Declarations Hook
#include <bic_text>

table   tccom100        |Customer master
table   tdsls400        |Sales orders
string  l.priority.desc(50)
boolean l.retb

|Functions Hook
function string get.customer.priority.description(domain tcbpid i.customer)
{
	select tccom100.prty
	from   tccom100
	where  tccom100._index1 = {:i.customer}
	selectdo
		return(enum.descr\$(tccom100.prty))
	endselect
	
	return("Unknown")
}

|Calculated Field: ext.customer.priority (Expression Type: Function)
function extern void ext.customer.priority.calculate()
{
	ext.customer.priority = get.customer.priority.description(tdsls400.ofbp)
}

|Custom Form Command: Update Priority
function extern boolean function.update.priority.is.visible()
{
	return(get.compnr() >= 0100)
}

function extern boolean function.update.priority.is.enabled()
{
	return(tdsls400.hdst = tdsls.hdst.free)
}

function extern function.update.priority.command.execute()
{
	string l.message(200)mb
	
	|Update customer priority based on order value
	if tdsls400.oamt > 100000 then
		select tccom100.*
		from   tccom100 for update
		where  tccom100._index1 = {:tdsls400.ofbp}
		selectdo
			if dal.change.object("tccom100") = 0 then
				dal.set.field("tccom100.prty", tcprty.high)
				if dal.save.object("tccom100") <> 0 then
					get.dal.all.messages(l.message)
					message(l.message)
					choice.again()
				endif
			endif
		endselect
	endif
}

| Table Extension: Custom Sales Order Fields
table ttxsls400ext
{
	domain	tcorno		orno		|Order Number
	domain	tcmcs.str10m	prty		|Customer Priority
	domain	tcmcs.str256m	sinst		|Special Instructions
	domain	tcmcs.str50m	dlpref		|Delivery Preference
	domain	tcyesno		rush		|Rush Order Flag
	domain	tclogn		logn		|Created By
	domain	tcdate		crdt		|Creation Date
	
	index1 orno
}

| Process Extension: Order Approval Workflow
function extern long before.save.salesorder(
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	double	l.credit.limit
	double	l.outstanding.amount
	
	tt.init.vars(
		l.ret,
		l.credit.limit,
		l.outstanding.amount,
		o.error
	)
	
	|Check credit limit for high-value orders
	if tdsls400.oamt > 50000 then
		select tccom100.crli
		from   tccom100
		where  tccom100._index1 = {:tdsls400.ofbp}
		selectdo
			l.credit.limit = tccom100.crli
			
			|Calculate outstanding amount
			select sum(tdsls400.oamt)
			from   tdsls400
			where  tdsls400.ofbp = {:tdsls400.ofbp}
			and    tdsls400.hdst in (tdsls.hdst.approved, tdsls.hdst.confirmed)
			selectdo
				l.outstanding.amount = sum(tdsls400.oamt)
			endselect
			
			|Check if order exceeds credit limit
			if (l.outstanding.amount + tdsls400.oamt) > l.credit.limit then
				o.error = "Order exceeds customer credit limit. Approval required."
				|Set order status to pending approval
				dal.set.field("tdsls400.hdst", tdsls.hdst.pending)
				return(-12)
			endif
		endselect
	endif
	
	|Save extension data
	if dal.new.object("txsls400") = 0 then
		dal.set.field("txsls400.orno", tdsls400.orno)
		dal.set.field("txsls400.prty", "High")
		dal.set.field("txsls400.sinst", tdsls400.rem1)
		dal.set.field("txsls400.pref", enum.descr\$(tdsls400.dlvm))
		dal.set.field("txsls400.rush", tdsls400.rush)
		dal.set.field("txsls400.logn", logname\$())
		dal.set.field("txsls400.crdt", utc.num())
		
		l.ret = dal.save.object("txsls400")
		if l.ret <> 0 then
			get.dal.all.messages(o.error)
			return(-12)
		endif
	endif
	
	return(0)
}

| BOD Extension Macros Reference:
| addValue() - Add string/numeric/date fields
| addAmountValue() - Add amount with currency
| addQuantityValue() - Add quantity with unit
| addCodeValue() - Add code with list reference
| getIdentifierValueFromIdentifierStructure() - Extract identifiers
| rdi.etoc\$() with etol() - Convert enum values (MANDATORY pattern)`,
  },
  {
    id: "rest-integration",
    title: "REST API Integration",
    prompt: "Generate 4GL code for API call implementation from LN with bearer token authentication and JSON response parsing.",
    code: `|#include <bic_httpclt>
|#include <bic_http>
|#include <bic_json>

function extern long txcom.external.api.integration(
    domain tcmcs.str256m i.api.url,
    domain tcmcs.str999m i.request.data,
    ref domain tcmcs.str999m o.response.data,
    ref domain tcmcs.str999m o.error
)
{
    long l.headerlist, l.queryparamlist, l.oauth2params
    long l.response.obj, l.fp, l.response.json
    string l.output.file(256)mb
    long l.status.code
    
    tt.init.vars(
        l.headerlist,
        l.queryparamlist,
        l.oauth2params,
        l.response.obj,
        l.fp,
        l.response.json,
        l.output.file,
        l.status.code,
        o.response.data,
        o.error
    )
    
    |Input validation
    if isspace(trim\$(i.api.url)) then
        o.error = "API URL is required"
        return(-12)
    endif
    
    |Create output file for response
    l.output.file = creat.tmp.file\$(bse.tmp.dir\$())
    l.fp = seq.open(l.output.file, "w+")
    if l.fp < 1 then
        o.error = "Failed to create response file"
        return(-12)
    endif
    
    |Setup OAuth2 authentication
    l.oauth2params = http.oauth2params.new(
        HTTP_OAUTH2_PARAMSET, "external_api_auth"
    )
    
    |Prepare headers
    l.headerlist = http.headerlist.new()
    http.headerlist.add(l.headerlist, "Content-Type", "application/json")
    http.headerlist.add(l.headerlist, "Accept", "application/json")
    
    |Setup query parameters (never hardcode in URL)
    l.queryparamlist = http.queryparamlist.new()
    http.queryparamlist.add(l.queryparamlist, "format", "json")
    http.queryparamlist.add(l.queryparamlist, "version", "v1")
    
    |Make HTTP POST request
    l.response.obj = http.post(
        trim\$(i.api.url),
        HTTP_HEADERLIST, l.headerlist,
        HTTP_OAUTH2PARAMS, l.oauth2params,
        HTTP_QUERYPARAMLIST, l.queryparamlist,
        HTTP_REQUESTBODYSTRING, trim\$(i.request.data),
        HTTP_VERIFYPEER, false,
        HTTP_VERIFYHOST, false,
        HTTP_RESPONSEBODYSTREAM, l.fp
    )
    
    |Check response status
    l.status.code = http.response.statuscode(l.response.obj)
    if l.status.code < 200 or l.status.code >= 300 then
        o.error = sprintf\$("HTTP Error: %d - %s", 
                          l.status.code, 
                          http.response.statustext(l.response.obj))
        |Cleanup
        http.response.delete(l.response.obj)
        _ = seq.close(l.fp)
        _ = file.rm(l.output.file)
        return(-12)
    endif
    
    |Read and parse response body
    _ = seq.rewind(l.fp)
    l.response.json = Json.read(l.fp, o.error)
    if l.response.json <> 0 then
        _ = Json.writeString(l.response.json, o.response.data)
        Json.delete(l.response.json)
    endif
    
    |Cleanup resources
    http.response.delete(l.response.obj)
    _ = seq.close(l.fp)
    _ = file.rm(l.output.file)
    
    return(0)
}`,
  },
  {
    id: "table-operations",
    title: "Table Operations",
    prompt: "Generate 4GL table query for tdsls400 to create a new record and if already present then update the existing record.",
    code: `|#include <bic_dal2>
|#include <bic_text>

function extern long txsls.create.or.update.order(
    domain    tcorno    i.order.number,
    domain    tcbpid    i.business.partner,
    domain    tcdate    i.order.date,
    ref domain tcmcs.str999m o.error
)
{
    long l.ret
    string l.error.message(512)
    
    tt.init.vars(
        l.ret,
        l.error.message,
        o.error
    )
    
    |MANDATORY: Validate all required fields FIRST
    if isspace(i.order.number) then
        o.error = "Order number is required"
        return(-12)
    endif
    
    if isspace(i.business.partner) then
        o.error = "Business partner is required"
        return(-12)
    endif
    
    |Check if order exists
    select tdsls400.orno
    from   tdsls400
    where  tdsls400._index1 = {:i.order.number}
    selectdo
        |Update existing order
        if dal.change.object("tdsls400") <> 0 then
            get.dal.all.messages(l.error.message)
            o.error = l.error.message
            return(-12)
        endif
        
        dal.set.field("tdsls400.ofbp", i.business.partner)    |Business Partner
        dal.set.field("tdsls400.odat", i.order.date)          |Order Date
        
        l.ret = dal.save.object("tdsls400")
        if l.ret <> 0 then
            get.dal.all.messages(l.error.message)
            o.error = l.error.message
            return(-12)
        endif
    selectempty
        |Create new order
        if dal.new.object("tdsls400") <> 0 then
            get.dal.all.messages(l.error.message)
            o.error = l.error.message
            return(-12)
        endif
        
        dal.set.field("tdsls400.orno", i.order.number)        |Order Number
        dal.set.field("tdsls400.ofbp", i.business.partner)    |Business Partner
        dal.set.field("tdsls400.odat", i.order.date)          |Order Date
        dal.set.field("tdsls400.hdst", tdsls.hdst.free)       |Order Status
        
        l.ret = dal.save.object("tdsls400")
        if l.ret <> 0 then
            get.dal.all.messages(l.error.message)
            o.error = l.error.message
            return(-12)
        endif
    endselect
    
    return(0)
}`,
  },
  {
    id: "json-parsing",
    title: "JSON Parsing",
    prompt: "Give 4GL code for JSON request body creation and parsing in LN.",
    code: `| JSON Creation and Parsing Functions
| Using correct 4GL JSON functions from JSON_Functions_Compact_Guide.md

function extern long create.json.from.input(
	string			i.test.value(256),
	ref	string		o.json.output(32000)mb,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.json.root
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.json.root,
		l.error,
		o.json.output,
		o.error
	)
	
	|Validate input parameter
	if isspace(i.test.value) then
		o.error = "Test value is required for JSON creation"
		return(-12)
	endif
	
	|Create JSON object using correct function
	l.json.root = Json.newObject()
	if l.json.root = 0 then
		o.error = "Failed to create JSON object"
		return(-12)
	endif
	
	|Add field to JSON using correct function
	Json.setString(l.json.root, "test", i.test.value)
	
	|Convert to JSON string using correct function
	l.ret = Json.writeString(l.json.root, o.json.output)
	if l.ret <> 0 then
		o.error = "Failed to convert JSON to string"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Cleanup memory
	Json.delete(l.json.root)
	
	return(0)
}

function extern long parse.json.to.output(
	string			i.json.input(32000)mb,
	ref	string		o.test.value(256),
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.json.root
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.json.root,
		l.error,
		o.test.value,
		o.error
	)
	
	|Validate input JSON
	if isspace(i.json.input) then
		o.error = "JSON input is required for parsing"
		return(-12)
	endif
	
	|Parse JSON string using correct function
	l.json.root = Json.readString(i.json.input, l.error)
	if l.json.root = 0 then
		o.error = "Invalid JSON format: " + l.error
		return(-12)
	endif
	
	|Check if field exists before extraction
	if not Json.has(l.json.root, "test") then
		o.error = "Field 'test' not found in JSON"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Extract test field value using correct function
	o.test.value = Json.getString(l.json.root, "test")
	
	|Validate extracted value
	if isspace(o.test.value) then
		o.error = "Test field value is empty in JSON"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Cleanup memory
	Json.delete(l.json.root)
	
	return(0)
}

function extern long create.complex.json(
	string			i.customer.name(100),
	string			i.customer.id(20),
	long			i.order.count,
	ref	string		o.json.output(32000)mb,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.json.root
	long	l.customer.object
	long	l.orders.array
	long	l.order.object
	long	l.index
	string	l.order.id(20)
	
	tt.init.vars(
		l.ret,
		l.json.root,
		l.customer.object,
		l.orders.array,
		l.order.object,
		l.index,
		l.order.id,
		o.json.output,
		o.error
	)
	
	|Create main JSON object
	l.json.root = Json.newObject()
	if l.json.root = 0 then
		o.error = "Failed to create root JSON object"
		return(-12)
	endif
	
	|Create customer object
	l.customer.object = Json.newObject()
	if l.customer.object = 0 then
		o.error = "Failed to create customer object"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Add customer fields
	Json.setString(l.customer.object, "name", i.customer.name)
	Json.setString(l.customer.object, "id", i.customer.id)
	
	|Create orders array
	l.orders.array = Json.newArray()
	if l.orders.array = 0 then
		o.error = "Failed to create orders array"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Add orders to array
	for l.index = 1 to i.order.count
		l.order.object = Json.newObject()
		if l.order.object <> 0 then
			l.order.id = "ORD" + str\$(l.index, "###")
			Json.setString(l.order.object, "orderId", l.order.id)
			Json.setNumber(l.order.object, "amount", l.index * 100.0)
			Json.add(l.orders.array, l.order.object)
		endif
	endfor
	
	|Add orders array to customer
	Json.set(l.customer.object, "orders", l.orders.array)
	
	|Add customer to root
	Json.set(l.json.root, "customer", l.customer.object)
	
	|Convert to string
	l.ret = Json.writeString(l.json.root, o.json.output)
	if l.ret <> 0 then
		o.error = "Failed to convert complex JSON to string"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Cleanup memory
	Json.delete(l.json.root)
	
	return(0)
}

function extern long parse.complex.json(
	string			i.json.input(32000)mb,
	ref	string		o.customer.name(100),
	ref	string		o.customer.id(20),
	ref	long		o.order.count,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.json.root
	long	l.customer.object
	long	l.orders.array
	long	l.order.object
	long	l.index
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.json.root,
		l.customer.object,
		l.orders.array,
		l.order.object,
		l.index,
		l.error,
		o.customer.name,
		o.customer.id,
		o.order.count,
		o.error
	)
	
	|Parse JSON string
	l.json.root = Json.readString(i.json.input, l.error)
	if l.json.root = 0 then
		o.error = "Invalid JSON format: " + l.error
		return(-12)
	endif
	
	|Get customer object
	if Json.has(l.json.root, "customer") then
		l.customer.object = Json.get(l.json.root, "customer")
		if l.customer.object <> 0 then
			|Extract customer fields
			if Json.has(l.customer.object, "name") then
				o.customer.name = Json.getString(l.customer.object, "name")
			endif
			
			if Json.has(l.customer.object, "id") then
				o.customer.id = Json.getString(l.customer.object, "id")
			endif
			
			|Get orders array
			if Json.has(l.customer.object, "orders") then
				l.orders.array = Json.get(l.customer.object, "orders")
				if l.orders.array <> 0 then
					o.order.count = Json.count(l.orders.array)
				endif
			endif
		endif
	else
		o.error = "Customer object not found in JSON"
		Json.delete(l.json.root)
		return(-12)
	endif
	
	|Cleanup memory
	Json.delete(l.json.root)
	
	return(0)
}

| JSON Function Reference (from JSON_Functions_Compact_Guide.md):
| Json.newObject() - Create new JSON object
| Json.newArray() - Create new JSON array
| Json.setString() - Set string value
| Json.setNumber() - Set number value
| Json.getString() - Get string value
| Json.getNumber() - Get number value
| Json.has() - Check if key exists
| Json.get() - Get JSON object/array
| Json.set() - Set JSON object/array
| Json.add() - Add to array
| Json.count() - Get array/object count
| Json.readString() - Parse JSON from string
| Json.writeString() - Convert JSON to string
| Json.delete() - Free JSON memory`,
  },
  {
    id: "xml-parsing",
    title: "XML Parsing",
    prompt: "Give 4GL code for XML request body creation and parsing in LN.",
    code: `| XML Creation and Parsing Functions
| Using correct 4GL XML functions from 4GL_XML_Functions_Compact_Template.md

function extern long create.xml.from.input(
	string			i.test1.value(256),
	ref	string		o.xml.output(32000)mb,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.xml.root
	long	l.test.element
	long	l.test1.element
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.xml.root,
		l.test.element,
		l.test1.element,
		l.error,
		o.xml.output,
		o.error
	)
	
	|Validate input parameter
	if isspace(i.test1.value) then
		o.error = "Test1 value is required for XML creation"
		return(-12)
	endif
	
	|Create root element using correct function
	l.test.element = xmlNewNode("test", XML_ELEMENT, 0)
	if l.test.element = 0 then
		o.error = "Failed to create root element"
		return(-12)
	endif
	
	|Create child element with data using correct function
	l.test1.element = xmlNewDataElement("test1", i.test1.value, l.test.element)
	if l.test1.element = 0 then
		o.error = "Failed to create test1 element"
		xmlDelete(l.test.element, 0)
		return(-12)
	endif
	
	|Convert XML to string using correct function
	l.ret = xmlWriteToString(o.xml.output, l.test.element)
	if l.ret <= 0 then
		o.error = "Failed to convert XML to string"
		xmlDelete(l.test.element, 0)
		return(-12)
	endif
	
	|Cleanup memory (MANDATORY)
	xmlDelete(l.test.element, 0)
	
	return(0)
}

function extern long parse.xml.to.output(
	string			i.xml.input(32000)mb,
	ref	string		o.test1.value(256),
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.xml.root
	long	l.test1.element
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.xml.root,
		l.test1.element,
		l.error,
		o.test1.value,
		o.error
	)
	
	|Validate input XML
	if isspace(i.xml.input) then
		o.error = "XML input is required for parsing"
		return(-12)
	endif
	
	|Parse XML string using correct function
	l.xml.root = xmlReadFromString(i.xml.input, l.error)
	if l.xml.root = 0 then
		o.error = "Invalid XML format: " + l.error
		return(-12)
	endif
	
	|Find test1 element using correct function
	l.test1.element = xmlFindFirst("test1", l.xml.root)
	if l.test1.element = 0 then
		o.error = "Element 'test1' not found in XML"
		xmlDelete(l.xml.root, 0)
		return(-12)
	endif
	
	|Extract text content using correct function
	o.test1.value = xmlData\$(l.test1.element)
	
	|Validate extracted value
	if isspace(o.test1.value) then
		o.error = "Test1 element is empty in XML"
		xmlDelete(l.xml.root, 0)
		return(-12)
	endif
	
	|Cleanup memory (MANDATORY)
	xmlDelete(l.xml.root, 0)
	
	return(0)
}

function extern long create.order.xml.with.attributes(
	string			i.order.id(20),
	string			i.order.date(10),
	string			i.customer.name(100),
	long			i.item.count,
	ref	string		o.xml.output(32000)mb,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.order.element
	long	l.customer.element
	long	l.items.element
	long	l.item.element
	long	l.index
	string	l.item.code(20)
	string	l.qty.str(10)
	
	tt.init.vars(
		l.ret,
		l.order.element,
		l.customer.element,
		l.items.element,
		l.item.element,
		l.index,
		l.item.code,
		l.qty.str,
		o.xml.output,
		o.error
	)
	
	|Create Order root element
	l.order.element = xmlNewNode("Order", XML_ELEMENT, 0)
	if l.order.element = 0 then
		o.error = "Failed to create Order element"
		return(-12)
	endif
	
	|Add attributes to Order element using correct function
	xmlSetAttribute(l.order.element, "id", i.order.id)
	xmlSetAttribute(l.order.element, "date", i.order.date)
	
	|Create Customer element with name attribute
	l.customer.element = xmlNewNode("Customer", XML_ELEMENT, l.order.element)
	if l.customer.element <> 0 then
		xmlSetAttribute(l.customer.element, "name", i.customer.name)
	endif
	
	|Create Items container element
	l.items.element = xmlNewNode("Items", XML_ELEMENT, l.order.element)
	if l.items.element = 0 then
		o.error = "Failed to create Items element"
		xmlDelete(l.order.element, 0)
		return(-12)
	endif
	
	|Add Item elements with attributes
	for l.index = 1 to i.item.count
		l.item.element = xmlNewNode("Item", XML_ELEMENT, l.items.element)
		if l.item.element <> 0 then
			l.item.code = "ITEM" + str\$(l.index, "###")
			l.qty.str = str\$(l.index)
			xmlSetAttribute(l.item.element, "code", l.item.code)
			xmlSetAttribute(l.item.element, "qty", l.qty.str)
		endif
	endfor
	
	|Convert to string using correct function
	l.ret = xmlWriteToString(o.xml.output, l.order.element)
	if l.ret <= 0 then
		o.error = "Failed to convert XML to string"
		xmlDelete(l.order.element, 0)
		return(-12)
	endif
	
	|Cleanup memory (MANDATORY)
	xmlDelete(l.order.element, 0)
	
	return(0)
}

function extern long parse.order.xml.with.attributes(
	string			i.xml.input(32000)mb,
	ref	string		o.order.id(20),
	ref	string		o.customer.name(100),
	ref	long		o.item.count,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.xml.root
	long	l.order.element
	long	l.customer.element
	long	l.items.element
	long	l.nodes
	long	l.found.count
	string	l.error(512)
	
	tt.init.vars(
		l.ret,
		l.xml.root,
		l.order.element,
		l.customer.element,
		l.items.element,
		l.nodes,
		l.found.count,
		l.error,
		o.order.id,
		o.customer.name,
		o.item.count,
		o.error
	)
	
	|Parse XML string
	l.xml.root = xmlReadFromString(i.xml.input, l.error)
	if l.xml.root = 0 then
		o.error = "Invalid XML format: " + l.error
		return(-12)
	endif
	
	|Find Order element
	l.order.element = xmlFindFirst("Order", l.xml.root)
	if l.order.element = 0 then
		o.error = "Order element not found in XML"
		xmlDelete(l.xml.root, 0)
		return(-12)
	endif
	
	|Extract Order attributes using correct function
	o.order.id = xmlAttribute\$(l.order.element, "id")
	
	|Find Customer element and extract name attribute
	l.customer.element = xmlFindFirst("Customer", l.order.element)
	if l.customer.element <> 0 then
		o.customer.name = xmlAttribute\$(l.customer.element, "name")
	endif
	
	|Find Items element and count Item children
	l.items.element = xmlFindFirst("Items", l.order.element)
	if l.items.element <> 0 then
		|Count Item elements using xmlFindNodes
		l.nodes = xmlFindNodes(l.items.element, "Item", 0, l.found.count)
		o.item.count = l.found.count
	endif
	
	|Cleanup memory (MANDATORY)
	xmlDelete(l.xml.root, 0)
	
	return(0)
}

| XML Function Reference (from 4GL_XML_Functions_Compact_Template.md):
| xmlReadFromString() - Parse XML from string
| xmlNewNode() - Create new XML element
| xmlNewDataElement() - Create element with text content
| xmlSetAttribute() - Set element attribute
| xmlAttribute\$() - Get element attribute
| xmlData\$() - Get element text content
| xmlSetData() - Set element text content
| xmlFindFirst() - Find first matching element
| xmlFindNodes() - Find multiple matching elements
| xmlWriteToString() - Convert XML to string
| xmlDelete() - Free XML memory (MANDATORY cleanup)`,
  },
  {
    id: "ui-scripts",
    title: "UI Scripts",
    prompt: "Create UI script for customer form validation with field events and duplicate checking.",
    code: `|4GL Process Session - Customer Data Processing
|Script Type: 123

declaration:
	#pragma used dll "otcextextapi"
	table ttccom100
	#include <bic_4gl2>
	#include <bic_dam>

	|Form fields
	extern domain tccom.bpid f.customer.code
	extern domain tccom.bpid t.customer.code
	extern domain tccom.bpty f.customer.type
	extern domain tcyesno f.validate.only
	extern domain tcyesno f.error.report

group.1:
init.group:
	get.screen.defaults()

|Field events with proper validation
field.f.customer.code:
before.display:
	set.fmin(f.customer.code)

when.field.changes:
	if not isspace(f.customer.code) then
		if not is.valid.customer.code(f.customer.code) then
			message("Invalid customer code format")
			input.again()
		endif
		
		select tccom100.bpid
		from   tccom100
		where  tccom100._index1 = {:f.customer.code}
		selectdo
			t.customer.code = f.customer.code
		selectempty
			message("Customer not found")
			input.again()
		endselect
	endif

field.t.customer.code:
before.display:
	set.fmax(t.customer.code)

field.f.customer.type:
selection.filter:
	query.extend.where.in.zoom("tccom.bpty.stat = tccom.stat.active")

when.field.changes:
	if f.customer.type = tccom.bpty.customer then
		message("Customer type selected")
	endif

|Choice events for UI buttons
choice.func.validate:
on.choice:
	string l.error(256)
	if validate.input.fields(l.error) <> 0 then
		message(l.error)
		choice.again()
	else
		message("Validation successful")
	endif

choice.func.process:
on.choice:
	string l.error(256)
	if process.customer.data(l.error) <> 0 then
		message(l.error)
	else
		message("Processing completed")
	endif

|Functions section
functions:

function long validate.input.fields(
	ref string o.error
)
{
FunctionUsage
	Expl:	Validate user input fields
	Output:	o.error - Error message
	Return:	long - 0 = success, 1 = error
EndFunctionUsage

	tt.init.vars(o.error)

	if isspace(f.customer.code) then
		o.error = "Customer code is required"
		return(1)
	endif

	return(0)
}

function boolean is.valid.customer.code(
	domain tccom.bpid i.customer.code
)
{
	long l.i
	string l.char(1)

	if len(i.customer.code) < 3 then
		return(false)
	endif

	for l.i = 1 to len(i.customer.code)
		l.char = mid\$(i.customer.code, l.i, 1)
		if not (isalpha(l.char) or isdigit(l.char)) then
			return(false)
		endif
	endfor

	return(true)
}

function long process.customer.data(
	ref string o.error
)
{
	tt.init.vars(o.error)

	select tccom100.bpid,
	       tccom100.nama
	from   tccom100
	where  tccom100.bpid >= {:f.customer.code}
	and    tccom100.bpid <= {:t.customer.code}
	selectdo
		|Process customer record
	endselect

	return(0)
}`,
  },
  {
    id: "reports-development",
    title: "Reports Development",
    prompt: "Give 4GL code for a sales summary report showing customer-wise sales totals and date range filtering.",
    code: `| Sales Summary Report - Customer-wise Analysis
| Using correct Infor Reports functions from Report.md and Reports_functions.md

declaration:
	#include <bic_dam>
	
	|Tables
	table ttdsls400
	table ttccom100
	
	|Global Variables
	long g.report
	
	|Form Variables (input parameters)
	extern domain tcdate f.from.date.f
	extern domain tcdate f.from.date.t
	extern domain tcdate f.to.date.f
	extern domain tcdate f.to.date.t
	
	|Report Variables (output to report)
	extern domain tcbpid r.customer.code
	extern domain tcnama r.customer.name
	extern domain tcamnt r.sales.total
	extern long r.order.count
	extern domain tcamnt r.average.order
	extern domain tcamnt r.grand.total
	extern long r.total.orders
	extern domain tcmcs.str132m r.error

function extern long process.sales.summary.report()
{
	|Variable Declaration
	domain tcdate l.from.date
	domain tcdate l.to.date
	double l.customer.total
	long l.customer.orders
	long l.ret
	
	|Variable Initialization
	tt.init.vars(
		l.from.date,
		l.to.date,
		l.customer.total,
		l.customer.orders,
		l.ret
	)
	
	l.from.date = f.from.date.f
	l.to.date = f.to.date.t
	
	|Open Report using correct function
	g.report = brp.open("txsls.sales.summary", "", 1)
	if g.report <= 0 then
		dal.set.error.message("txsls.0001")
		|Cannot open report
		show.dal.messages()
		return(DALHOOKERROR)
	endif
	
	|Initialize grand totals
	r.grand.total = 0.0
	r.total.orders = 0
	
	|Main Processing Logic - Customer summary query
	select tdsls400.ofbp:r.customer.code,
	       tccom100.nama:r.customer.name,
	       sum(tdsls400.amnt):l.customer.total,
	       count(*):l.customer.orders
	from   tdsls400, tccom100
	where  tdsls400.odat >= :l.from.date
	and    tdsls400.odat <= :l.to.date
	and    tdsls400.hdst = tdsls.hdst.approved
	and    tccom100._index1 = {:tdsls400.ofbp}
	group by tdsls400.ofbp, tccom100.nama
	order by tdsls400.ofbp
	selectdo
		|Process each customer record
		db.retry.point()
		
		|Assign values to report variables
		r.sales.total = l.customer.total
		r.order.count = l.customer.orders
		
		|Calculate average order value
		if l.customer.orders > 0 then
			r.average.order = l.customer.total / l.customer.orders
		else
			r.average.order = 0.0
		endif
		
		|Accumulate grand totals
		r.grand.total = r.grand.total + l.customer.total
		r.total.orders = r.total.orders + l.customer.orders
		
		|Send data to report using correct function
		brp.ready(g.report)
		
		commit.transaction()
	endselect
	
	|Close Report using correct function
	brp.close(g.report)
	
	return(0)
}

|Report Script Sections (main_section.<layout_number>:)
before.report.1:
before.layout:
	|Report header setup using predefined variables
	lattr.print = tcyesno.yes
	|Print report title and parameters

header.1:
before.layout:
	|Page header with column titles
	lattr.print = tcyesno.yes

detail.1:
before.layout:
	|Detail line formatting
	if not lattr.enddata then
		lattr.print = tcyesno.yes
	else
		lattr.print = tcyesno.no
	endif

footer.1:
before.layout:
	|Page footer with page number
	lattr.print = tcyesno.yes

after.report.1:
before.layout:
	|Grand totals and summary
	lattr.print = tcyesno.yes

function extern long generate.excel.sales.report(
	domain	tcdate		i.from.date,
	domain	tcdate		i.to.date,
	ref	string		o.excel.file(256)mb,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.file.pointer
	string	l.csv.line(1000)
	string	l.temp.file(256)
	domain	tcbpid	l.customer.code
	domain	tcnama	l.customer.name
	double	l.sales.total
	long	l.order.count
	double	l.average.order
	
	tt.init.vars(
		l.ret,
		l.file.pointer,
		l.csv.line,
		l.temp.file,
		l.customer.code,
		l.customer.name,
		l.sales.total,
		l.order.count,
		l.average.order,
		o.excel.file,
		o.error
	)
	
	|Create temporary CSV file for Excel import
	l.temp.file = bse.tmp.dir\$() + "sales_summary_" + str\$(utc.num()) + ".csv"
	
	l.file.pointer = seq.open(l.temp.file, "w")
	if l.file.pointer <= 0 then
		o.error = "Cannot create temporary file for Excel export"
		return(-12)
	endif
	
	|Write CSV header
	l.csv.line = "Customer Code,Customer Name,Total Sales,Order Count,Average Order"
	seq.puts(l.csv.line, l.file.pointer)
	
	|Write data rows
	select tdsls400.ofbp,
	       tccom100.nama,
	       sum(tdsls400.amnt),
	       count(*)
	from   tdsls400, tccom100
	where  tdsls400.odat >= :i.from.date
	and    tdsls400.odat <= :i.to.date
	and    tdsls400.hdst = tdsls.hdst.approved
	and    tccom100._index1 = {:tdsls400.ofbp}
	group by tdsls400.ofbp, tccom100.nama
	order by sum(tdsls400.amnt) desc
	selectdo
		l.customer.code = tdsls400.ofbp
		l.customer.name = tccom100.nama
		l.sales.total = sum(tdsls400.amnt)
		l.order.count = count(*)
		
		if l.order.count > 0 then
			l.average.order = l.sales.total / l.order.count
		else
			l.average.order = 0.0
		endif
		
		|Build CSV line with proper escaping
		l.csv.line = l.customer.code + "," +
		             "\"" + l.customer.name + "\"," +
		             str\$(l.sales.total, "###,###,##0.00") + "," +
		             str\$(l.order.count) + "," +
		             str\$(l.average.order, "###,###,##0.00")
		
		seq.puts(l.csv.line, l.file.pointer)
	endselect
	
	|Close file
	seq.close(l.file.pointer)
	
	|Set output file path
	o.excel.file = l.temp.file
	
	return(0)
}

|Report Function Reference (from Reports_functions.md):
|brp.open() - Activate report and open spooler device
|brp.ready() - Signal that record is ready for import
|brp.close() - Stop report writer and send to printer
|rprt_open() - Short version of brp.open()
|rprt_send() - Short version of brp.ready()
|rprt_close() - Short version of brp.close()

|Predefined Variables (from Report.md):
|lattr.print - Controls whether layout is printed
|lattr.pageno - Current page number
|lattr.enddata - End of data indicator
|lattr.break - Break level indicator
|lattr.lineno - Current line number`,
  },
  {
    id: "endpoint-policies",
    title: "Endpoint Policies",
    prompt: "Create an Infor API Gateway endpoint policy for JSON to XML transformation with Handlebars template.",
    code: `| Infor API Gateway Endpoint Policy: JSON to XML Transform
| Policy Configuration with Handlebars Template Engine

<?xml version="1.0" encoding="UTF-8"?>
<jsonTransform continueOnError="false" 
               displayName="Customer JSON to XML Transform"
               enabled="true" 
               name="Customer-JSON-to-XML" 
               version="1.0"
    xmlns="http://www.infor.com/ion/api"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.infor.com/ion/api jsonTransform.xsd">
    
    <!-- Optional matcher for conditional application -->
    <matcher matchKind="string" 
             matchValue="application/json" 
             matchAction="apply"/>
    
    <transformations>
        <transform kind="handlebars" outputType="text/xml">
            <![CDATA[
            <?xml version="1.0" encoding="UTF-8"?>
            {{#if customer}}
            <Customer>
                {{#if customer.name}}
                <Name>{{replace (replace (replace (replace (replace customer.name "&" "&amp;") "<" "&lt;") ">" "&gt;") "\"" "&quot;") "'" "&apos;"}}</Name>
                {{else}}
                <Name>UNKNOWN</Name>
                {{/if}}
                
                {{#if customer.id}}
                <ID>{{replace (replace (replace (replace (replace customer.id "&" "&amp;") "<" "&lt;") ">" "&gt;") "\"" "&quot;") "'" "&apos;"}}</ID>
                {{else}}
                <ID>NOT_PROVIDED</ID>
                {{/if}}
                
                {{#if customer.email}}
                <Email>{{replace (replace (replace (replace (replace customer.email "&" "&amp;") "<" "&lt;") ">" "&gt;") "\"" "&quot;") "'" "&apos;"}}</Email>
                {{/if}}
                
                {{#if customer.address}}
                <Address>
                    <Street>{{replace (replace (replace (replace (replace customer.address.street "&" "&amp;") "<" "&lt;") ">" "&gt;") "\"" "&quot;") "'" "&apos;"}}</Street>
                    <City>{{replace (replace (replace (replace (replace customer.address.city "&" "&amp;") "<" "&lt;") ">" "&gt;") "\"" "&quot;") "'" "&apos;"}}</City>
                    <State>{{customer.address.state}}</State>
                    <ZipCode>{{customer.address.zipCode}}</ZipCode>
                </Address>
                {{/if}}
                
                {{#if customer.orders}}
                <Orders>
                    {{#if customer.orders.length}}
                        {{#each customer.orders}}
                        <Order>
                            <OrderID>{{orderId}}</OrderID>
                            <OrderDate>{{orderDate}}</OrderDate>
                            <Amount>{{amount}}</Amount>
                            <Status>{{status}}</Status>
                            {{#if items}}
                            <Items>
                                {{#each items}}
                                <Item>
                                    <ProductID>{{productId}}</ProductID>
                                    <Quantity>{{quantity}}</Quantity>
                                    <Price>{{price}}</Price>
                                </Item>
                                {{/each}}
                            </Items>
                            {{/if}}
                        </Order>
                        {{/each}}
                    {{else}}
                        <Order>
                            <OrderID>{{customer.orders.orderId}}</OrderID>
                            <OrderDate>{{customer.orders.orderDate}}</OrderDate>
                            <Amount>{{customer.orders.amount}}</Amount>
                            <Status>{{customer.orders.status}}</Status>
                        </Order>
                    {{/if}}
                </Orders>
                {{/if}}
            </Customer>
            {{else}}
            <Error>
                <Code>MISSING_CUSTOMER</Code>
                <Message>Customer object is required</Message>
                <Timestamp>{{date 'yyyy-MM-dd HH:mm:ss'}}</Timestamp>
            </Error>
            {{/if}}
            ]]>
        </transform>
    </transformations>
</jsonTransform>

| Error Handling Policy for Failed Transformations
<?xml version="1.0" encoding="UTF-8"?>
<jsonTransform continueOnError="false" 
               displayName="Error Response Handler"
               enabled="true" 
               name="Error-Response-Handler" 
               version="1.0"
    xmlns="http://www.infor.com/ion/api"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.infor.com/ion/api jsonTransform.xsd">
    
    <transformations>
        <transform kind="handlebars" outputType="application/json">
            <![CDATA[
            {
                "timestamp": "{{date 'yyyy-MM-dd HH:mm:ss'}}",
                "status": "{{#if status}}{{status}}{{else}}Error{{/if}}",
                "error": {
                    "code": "{{#if errorCode}}{{errorCode}}{{else}}TRANSFORMATION_ERROR{{/if}}",
                    "message": "{{#if errorMessage}}{{errorMessage}}{{else}}Transformation failed{{/if}}",
                    "details": "{{errorDetails}}"
                },
                {{#if correlationId}}
                "correlationId": "{{correlationId}}",
                {{/if}}
                "path": "{{requestPath}}"
            }
            ]]>
        </transform>
    </transformations>
</jsonTransform>

| JSON to JSON Transform with JSONPath
<?xml version="1.0" encoding="UTF-8"?>
<jsonTransform continueOnError="false" 
               displayName="JSON Field Mapping"
               enabled="true" 
               name="JSON-Field-Mapping" 
               version="1.0"
    xmlns="http://www.infor.com/ion/api"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.infor.com/ion/api jsonTransform.xsd">
    
    <transformations>
        <transform kind="handlebars" outputType="application/json">
            <![CDATA[
            {
                "customerId": "{{jsonPath '\$.customer.id'}}",
                "customerName": "{{jsonPath '\$.customer.name'}}",
                "totalOrders": {{jsonPath '\$.customer.orders.length'}},
                "orderDetails": [
                    {{#each (jsonPath '\$.customer.orders')}}
                    {
                        "orderId": "{{orderId}}",
                        "orderDate": "{{orderDate}}",
                        "totalAmount": {{amount}},
                        "itemCount": {{items.length}}
                    }{{#if @last}}{{else}},{{/if}}
                    {{/each}}
                ],
                "processedAt": "{{date 'yyyy-MM-dd HH:mm:ss'}}"
            }
            ]]>
        </transform>
    </transformations>
</jsonTransform>

| Policy Features:
| - Handlebars template engine for dynamic transformations
| - XML character escaping for special characters (&, <, >, ", ')
| - Conditional field mapping with {{#if}} statements
| - Array handling with {{#each}} loops
| - JSONPath expressions for complex data extraction
| - Error handling with fallback values
| - Date formatting with {{date}} helper
| - Namespace support for XML output
| - CDATA sections to prevent XML parsing issues`,
  },
  {
    id: "generic-4gl",
    title: "Generic 4GL Code",
    prompt: "Generate 4GL code for a function that validates customer data before creating a new customer record.",
    code: `|#include <bic_dal2>
|#include <bic_text>

|Customer validation function following master 4GL rules
function extern long validate.customer.data(
	domain	tccom.bpid		i.customer.code,
	domain	tcmcs.str60m		i.customer.name,
	domain	tcmcs.str60m		i.address,
	domain	tcmcs.str20m		i.phone,
	ref	domain	tcmcs.str999m	o.error
)
{
    long l.ret
    string l.error.message(512)
    string l.temp.message(256)
    
    |MANDATORY: Initialize ALL variables first using tt.init.vars()
    tt.init.vars(
        l.ret,
        l.error.message,
        l.temp.message,
        o.error
    )
    
    |MANDATORY: Validate all required fields FIRST
    if isspace(i.customer.code) then
        o.error = "Customer code is required"
        return(-12)
    endif
    
    if isspace(i.customer.name) then
        o.error = "Customer name is required"
        return(-12)
    endif
    
    |Validate customer code format (minimum 3 characters)
    if length(i.customer.code) < 3 then
        o.error = "Customer code must be at least 3 characters"
        return(-12)
    endif
    
    |Check if customer already exists using proper table alias
    select a_tccom100.bpid
    from   tccom100 a_tccom100
    where  a_tccom100._index1 = {:i.customer.code}
    as set with 1 rows
    selectdo
        l.temp.message = "Customer code already exists: "
        o.error = l.temp.message & i.customer.code
        return(-12)
    endselect
    
    |Validate phone number format if provided
    if not isspace(i.phone) then
        if length(i.phone) < 10 then
            o.error = "Phone number must be at least 10 digits"
            return(-12)
        endif
        
        |Check for valid phone number characters using helper function
        l.ret = validate.phone.format(
            i.phone,
            l.error.message
        )
        if l.ret <> 0 then
            o.error = l.error.message
            return(-12)
        endif
    endif
    
    |Validate address if provided
    if not isspace(i.address) then
        if len(i.address) < 9 then
            o.error = "Address must be at least 9 characters"
            return(-12)
        endif
    endif
    
    |All validations passed - return success
    return(0)
}

|Helper function for phone validation following 4GL rules
function long validate.phone.format(
	domain	tcmcs.str20m		i.phone.number,
	ref	domain	tcmcs.str999m	o.error.message
)
{
    long l.i
    string l.char(1)
    string l.temp.message(256)
    
    tt.init.vars(
        l.i,
        l.char,
        l.temp.message,
        o.error.message
    )
    
    |Check each character - allow digits, spaces, hyphens, parentheses
    for l.i = 1 to length(i.phone.number)
        l.char = str.substring\$(i.phone.number, l.i, l.i+1)
        
        if not (isdigit(l.char) or 
                l.char = " " or 
                l.char = "-" or 
                l.char = "(" or 
                l.char = ")") then
            l.temp.message = "Invalid character in phone number: "
            o.error.message = l.temp.message & l.char
            return(-12)
        endif
    endfor
    
    return(0)
}`,
  },
  {
    id: "odata-apis",
    title: "OData REST APIs",
    prompt: "Generate OData schema and 4GL code for PurchaseOrder where logic handles order creation with validation.",
    code: `<?xml version="1.0"?>
<Schema Namespace="txpur.PurchaseOrder" SchemaType="STD">
  <Container Name="PurchaseOrder_Resources">
    <EntitySet Name="PurchaseOrders" Type="txpur.PurchaseOrder.PurchaseOrder">
      <OptimisticConcurrency/>
      <DeepInsertSupport/>
    </EntitySet>
    <ActionImport Name="createPurchaseOrder" Action="txpur.PurchaseOrder.createPurchaseOrder"/>
  </Container>

  <EntityType Binding="txpur400" Name="PurchaseOrder">
    <Property Sequence="1" Binding="txpur400.orno" Active="true" Name="OrderNumber" 
              Description="Purchase Order Number" Type="Edm.String" Nullable="false"/>
    <Property Sequence="2" Binding="txpur400.ofbp" Active="true" Name="Supplier" 
              Description="Supplier Code" Type="Edm.String" Nullable="false"/>
    <Property Sequence="3" Binding="txpur400.odat" Active="true" Name="OrderDate" 
              Description="Order Date" Type="Edm.DateTimeOffset" Nullable="false"/>
    
    <Key>
      <PropertyRef Name="OrderNumber"/>
    </Key>
    
    <Restrictions>
      <Readable/>
      <ReadableByKey/>
      <Insertable/>
      <Updatable/>
    </Restrictions>
  </EntityType>

  <Action Name="createPurchaseOrder" IsBound="false" 
          DllFunction="otxpurdll0400::txpur.dll0400.create.purchase.order">
    <ReturnType Type="txpur.PurchaseOrder.CreateOrderResponse" LnType="ComplexValue"/>
    <Parameter Name="SupplierCode" Type="Edm.String" LnType="String" Nullable="false"/>
    <Parameter Name="OrderDate" Type="Edm.DateTimeOffset" LnType="Long" Nullable="false"/>
  </Action>

  <ComplexType Name="CreateOrderResponse">
    <Property Name="Success" Type="Edm.Boolean" Nullable="false"/>
    <Property Name="OrderNumber" Type="Edm.String" Nullable="false"/>
    <Property Name="Message" Type="Edm.String" Nullable="false"/>
  </ComplexType>
</Schema>

|DLL Implementation (txpurdll0400.lib)
#include <bic_dal2>
#pragma used dll ottwebodata_api

function extern long txpur.dll0400.create.purchase.order(
    domain ttjson i.input,
    ref domain ttjson o.output
)
{
    domain tcbpid l.supplier.code
    long l.order.date, l.ret
    domain tcorno l.new.order.number
    
    tt.init.vars(
        l.supplier.code,
        l.order.date,
        l.ret,
        l.new.order.number
    )
    
    o.output = OData.ComplexValue.new()
    
    |Extract parameters from JSON input
    if OData.ComplexValue.has(i.input, "SupplierCode") then
        l.ret = OData.ComplexValue.getString(i.input, "SupplierCode", l.supplier.code)
    else
        OData.ComplexValue.setBoolean(o.output, "Success", false)
        OData.ComplexValue.setString(o.output, "Message", "Supplier code is mandatory")
        return(0)
    endif
    
    |Generate new order number
    l.new.order.number = "PO" + str\$(utc.num())
    
    |Create purchase order with proper DAL validation
    if dal.new.object("txpur400") <> 0 then
        OData.ComplexValue.setBoolean(o.output, "Success", false)
        OData.ComplexValue.setString(o.output, "Message", "Failed to create order")
        return(0)
    endif
    
    dal.set.field("txpur400.orno", l.new.order.number)    |Order Number
    dal.set.field("txpur400.ofbp", l.supplier.code)       |Supplier
    dal.set.field("txpur400.odat", l.order.date)          |Order Date
    dal.set.field("txpur400.hdst", tdsls.hdst.free)       |Status
    
    l.ret = dal.save.object("txpur400")
    if l.ret <> 0 then
        OData.ComplexValue.setBoolean(o.output, "Success", false)
        OData.ComplexValue.setString(o.output, "Message", "Failed to save order")
        return(0)
    endif
    
    |Create response
    OData.ComplexValue.setBoolean(o.output, "Success", true)
    OData.ComplexValue.setString(o.output, "OrderNumber", l.new.order.number)
    OData.ComplexValue.setString(o.output, "Message", "Order created successfully")
    
    return(0)
}`,
  },
  {
    id: "public-interfaces",
    title: "Public Interfaces",
    prompt: "Use PurchaseOrders.StartOverview public interface to create purchase order overview session.",
    code: `|#pragma used dll "tdextpurapi"
|#pragma used dll "tfextgldapi"
|#include <bic_dal2>

| LN Public Interface Implementation
| Purchase Order Overview and Account Validation

function extern long start.purchase.order.overview(
	domain	tcorno		i.order.number,
	domain	tccom.bpid	i.supplier,
	ref	domain	tcorno		o.selected.order,
	ref	domain	tcmcs.s999m	o.error
)
{
	long	l.ret
	long	l.start.mode
	long	l.session.index
	long	l.exception.id
	string	l.start.filter(30)
	string	l.query.extend(1000)
	
	tt.init.vars(
		l.ret,
		l.start.mode,
		l.session.index,
		l.exception.id,
		l.start.filter,
		l.query.extend,
		o.selected.order,
		o.error
	)
	
	|Validate input parameters
	if isspace(i.order.number) and isspace(i.supplier) then
		o.error = "Either order number or supplier must be provided"
		return(-12)
	endif
	
	|Set start mode to MODAL for zoom session
	l.start.mode = 1  |MODAL
	l.session.index = 1  |Purchase Order index
	
	|Build query filter if order number provided
	if not isspace(i.order.number) then
		l.query.extend = "tdpur400.orno = '" + i.order.number + "'"
	endif
	
	|Call LN Public Interface: PurchaseOrders.StartOverview
	l.ret = PurchaseOrders.StartOverview(
		l.start.mode,
		l.start.filter,
		l.session.index,
		l.query.extend,
		i.order.number,
		i.supplier,
		"",
		"",
		"",
		o.selected.order,
		o.error,
		l.exception.id
	)
	
	if l.ret <> 0 then
		if isspace(o.error) then
			o.error = "Failed to start Purchase Order overview session"
		endif
		return(-12)
	endif
	
	return(0)
}

function extern long validate.account.dimensions(
	domain	tcncmp		i.financial.company,
	domain	tcdate		i.check.date,
	domain	tfgld.leac	i.ledger.account,
	domain	tfgld.dimn	i.dimension.number,
	domain	tfgld.dimx	i.dimensions(),
	ref	boolean		o.valid.dimensions,
	ref	domain	tcmcs.s999m	o.error
)
{
	long	l.ret
	long	l.exception.id
	string	l.exception.message(999)
	
	tt.init.vars(
		l.ret,
		l.exception.id,
		l.exception.message,
		o.valid.dimensions,
		o.error
	)
	
	|Validate mandatory parameters
	if i.financial.company = 0 then
		o.error = "Financial company is mandatory"
		return(-12)
	endif
	
	if i.check.date = 0 then
		o.error = "Check date is mandatory"
		return(-12)
	endif
	
	if isspace(i.ledger.account) then
		o.error = "Ledger account is mandatory"
		return(-12)
	endif
	
	|Call LN Public Interface: Account.CrossValidateDimensions
	l.ret = Account.CrossValidateDimensions(
		i.financial.company,
		i.check.date,
		i.ledger.account,
		i.dimension.number,
		i.dimensions,
		o.valid.dimensions,
		l.exception.message,
		l.exception.id
	)
	
	if l.ret <> 0 then
		o.error = "Account dimension validation failed"
		if not isspace(l.exception.message) then
			o.error = o.error + ": " + l.exception.message
		endif
		return(-12)
	endif
	
	|Check validation result
	if not o.valid.dimensions then
		o.error = "Dimensions are not valid according to cross validation rules"
		if not isspace(l.exception.message) then
			o.error = o.error + ": " + l.exception.message
		endif
		return(-12)
	endif
	
	return(0)
}

| Public Interface Usage Patterns:
| 1. Always include proper #pragma used dll declarations
| 2. Validate all mandatory parameters before calling interface
| 3. Handle exception IDs and messages properly
| 4. Use appropriate start modes (MODAL/MODELESS) for sessions
| 5. Initialize all variables with tt.init.vars()
| 6. Return 0 for success, -12 for errors
| 7. Provide meaningful error messages for troubleshooting`,
  },
  {
    id: "trusted-functions",
    title: "Trusted Functions",
    prompt: "Show me all trusted string manipulation functions for 4GL with examples.",
    code: `|Trusted Functions Library - Complete Reference
|All functions listed are validated and marked as "trusted": true

|=== CORE STRING FUNCTIONS ===

|String length and validation using trusted functions
function long validate.string.input(
	domain tcmcs.str256m i.input.string,
	long i.min.length,
	long i.max.length,
	ref domain tcmcs.str999m o.error
)
{
	long l.string.length
	
	tt.init.vars(l.string.length, o.error)
	
	|TRUSTED: len() function from core_functions.json
	l.string.length = len(i.input.string)
	
	if l.string.length < i.min.length then
		|TRUSTED: str\$() function for conversion
		o.error = "String too short. Minimum " & str\$(i.min.length) & " characters"
		return(-12)
	endif
	
	if l.string.length > i.max.length then
		o.error = "String too long. Maximum " & str\$(i.max.length) & " characters"
		return(-12)
	endif
	
	|TRUSTED: isspace() function
	if isspace(i.input.string) then
		o.error = "String cannot be empty"
		return(-12)
	endif
	
	return(0)
}

|=== DATABASE FUNCTIONS ===

|Customer creation using trusted DAL functions
function long create.customer.record(
	domain tccom.bpid i.customer.code,
	domain tcmcs.str60m i.customer.name,
	ref domain tcmcs.str999m o.error
)
{
	long l.ret
	
	tt.init.vars(l.ret, o.error)
	
	|TRUSTED: dal.new.object() from database_functions.json
	l.ret = dal.new.object("tccom100")
	if l.ret <> 0 then
		o.error = "Failed to create new customer object"
		return(-12)
	endif
	
	|TRUSTED: dal.set.field() function
	dal.set.field("tccom100.bpid", i.customer.code)
	dal.set.field("tccom100.nama", i.customer.name)
	dal.set.field("tccom100.stat", tccom.stat.active)
	
	|TRUSTED: dal.save.object() function
	l.ret = dal.save.object("tccom100")
	if l.ret <> 0 then
		|TRUSTED: dal.set.error.message() function
		dal.set.error.message("Failed to save customer record")
		return(-12)
	endif
	
	|TRUSTED: commit.transaction() function
	commit.transaction()
	
	return(0)
}

|=== HTTP FUNCTIONS ===

|REST API call using trusted HTTP functions
function long make.api.request(
	domain tcmcs.str256m i.endpoint.url,
	domain tcmcs.str999m i.request.body,
	ref domain tcmcs.str999m o.response,
	ref domain tcmcs.str999m o.error
)
{
	long l.ret
	long l.header.list
	
	tt.init.vars(
		l.ret,
		l.header.list,
		o.response,
		o.error
	)
	
	|TRUSTED: http.headerlist.new() from http_network_functions.json
	l.header.list = http.headerlist.new()
	
	|TRUSTED: http.headerlist.add() function
	http.headerlist.add(
		l.header.list,
		"Content-Type",
		"application/json"
	)
	
	|TRUSTED: http.post() function
	l.ret = http.post(
		i.endpoint.url,
		HTTP_HEADERLIST,
		l.header.list,
		HTTP_REQUESTBODYSTRING,
		i.request.body,
		HTTP_RESPONSEBODYSTRING,
		o.response
	)
	
	if l.ret <> 0 then
		o.error = "HTTP request failed with code: " & str\$(l.ret)
		return(-12)
	endif
	
	return(0)
}

|=== STRING MANIPULATION ===

|Text processing using trusted string functions
function string format.customer.display(
	domain tccom.bpid i.customer.code,
	domain tcmcs.str60m i.customer.name
)
{
	string l.formatted.string(256)
	string l.temp.string(100)
	long l.name.length
	
	tt.init.vars(
		l.formatted.string,
		l.temp.string,
		l.name.length
	)
	
	|TRUSTED: String concatenation
	l.formatted.string = i.customer.code
	
	if not isspace(i.customer.name) then
		|TRUSTED: len() function
		l.name.length = len(i.customer.name)
		
		if l.name.length > 30 then
			|TRUSTED: str.substring\$() function
			l.temp.string = str.substring\$(i.customer.name, 1, 30)
			l.temp.string = l.temp.string & "..."
		else
			l.temp.string = i.customer.name
		endif
		
		|TRUSTED: trim\$() function
		l.temp.string = trim\$(l.temp.string)
		
		|TRUSTED: toupper\$() function
		l.temp.string = toupper\$(l.temp.string)
		
		l.formatted.string = l.formatted.string & " - " & l.temp.string
	endif
	
	return(l.formatted.string)
}`,
  },
  {
    id: "predefined-functions",
    title: "Predefined Functions",
    prompt: "Show me the most commonly used 4GL predefined functions with examples for string and database operations.",
    code: `|Most Used 4GL Predefined Functions - Complete Reference
|Based on Dataset/06-PredefinedFunctions/01-MostUsed/

|=== STRING OPERATIONS ===

function string process.customer.name(
	domain tcmcs.str60m i.customer.name
)
{
	string l.processed.name(60)
	long l.name.length
	long l.space.position
	
	tt.init.vars(
		l.processed.name,
		l.name.length,
		l.space.position
	)
	
	|Check if name is empty
	if isspace(i.customer.name) then
		return("Unknown Customer")
	endif
	
	|Get string length
	l.name.length = len(i.customer.name)
	
	|Remove leading/trailing spaces
	l.processed.name = trim\$(i.customer.name)
	
	|Convert to proper case (first letter uppercase)
	if l.name.length > 0 then
		l.processed.name = toupper\$(str.substring\$(l.processed.name, 1, 1)) &
		                  tolower\$(str.substring\$(l.processed.name, 2))
	endif
	
	|Find position of space for last name processing
	l.space.position = pos(" ", l.processed.name)
	if l.space.position > 0 then
		|Process last name to uppercase
		l.processed.name = str.substring\$(l.processed.name, 1, l.space.position) &
		                  toupper\$(str.substring\$(l.processed.name, l.space.position + 1, 1)) &
		                  tolower\$(str.substring\$(l.processed.name, l.space.position + 2))
	endif
	
	return(l.processed.name)
}

|=== DATABASE OPERATIONS ===

function long create.customer.record(
	domain tccom.bpid i.customer.code,
	domain tcmcs.str60m i.customer.name,
	ref domain tcmcs.str999m o.error
)
{
	long l.ret
	
	tt.init.vars(l.ret, o.error)
	
	|Set database retry point
	db.retry.point()
	
	|Create new customer object
	l.ret = dal.new.object("tccom100")
	if l.ret <> 0 then
		o.error = "Failed to create customer object"
		return(-12)
	endif
	
	|Set field values
	dal.set.field("tccom100.bpid", i.customer.code)
	dal.set.field("tccom100.nama", i.customer.name)
	dal.set.field("tccom100.stat", tccom.stat.active)
	dal.set.field("tccom100.cdat", utc.num())
	dal.set.field("tccom100.logn", logname\$())
	
	|Save the object
	l.ret = dal.save.object("tccom100")
	if l.ret <> 0 then
		get.dal.all.messages(o.error)
		abort.transaction()
		return(-12)
	endif
	
	|Commit transaction
	commit.transaction()
	
	return(0)
}

|=== DATE/TIME OPERATIONS ===

function string format.business.date(
	domain ttdate i.business.date
)
{
	long l.year
	long l.month
	long l.day
	string l.formatted.date(20)
	
	tt.init.vars(
		l.year,
		l.month,
		l.day,
		l.formatted.date
	)
	
	|Convert date number to components
	num.to.date(i.business.date, l.year, l.month, l.day)
	
	|Format as DD/MM/YYYY
	l.formatted.date = str\$(l.day) & "/" & str\$(l.month) & "/" & str\$(l.year)
	
	return(l.formatted.date)
}

function long calculate.days.between(
	domain ttdate i.start.date,
	domain ttdate i.end.date
)
{
	long l.days.difference
	
	|Simple date arithmetic
	l.days.difference = i.end.date - i.start.date
	
	return(l.days.difference)
}

|=== MATHEMATICAL OPERATIONS ===

function double calculate.percentage(
	double i.part.value,
	double i.total.value
)
{
	double l.percentage
	
	tt.init.vars(l.percentage)
	
	|Avoid division by zero
	if i.total.value = 0 then
		return(0)
	endif
	
	|Calculate percentage
	l.percentage = (i.part.value / i.total.value) * 100
	
	|Round to 2 decimal places
	l.percentage = round(l.percentage, 2, 0)
	
	return(l.percentage)
}

|=== ENUM OPERATIONS ===

function string get.status.description(
	domain tccom.stat i.status.code
)
{
	string l.status.description(50)
	
	tt.init.vars(l.status.description)
	
	|Get enum description
	l.status.description = enum.descr\$("tccom.stat", i.status.code)
	
	|Handle empty description
	if isspace(l.status.description) then
		l.status.description = "Unknown Status"
	endif
	
	return(l.status.description)
}

|=== FILE OPERATIONS ===

function long write.log.entry(
	domain tcmcs.str256m i.log.message
)
{
	long l.fp
	string l.log.file(256)
	string l.timestamp(20)
	string l.log.entry(512)
	
	tt.init.vars(
		l.fp,
		l.log.file,
		l.timestamp,
		l.log.entry
	)
	
	|Create log file path
	l.log.file = bse.tmp.dir\$() & "application.log"
	
	|Open file for append
	l.fp = seq.open(l.log.file, "a")
	if l.fp <= 0 then
		return(-12)
	endif
	
	|Create timestamped entry
	l.timestamp = num.to.date\$(date.num(), 2)
	l.log.entry = l.timestamp & " - " & logname\$() & " - " & i.log.message
	
	|Write to file
	seq.puts(l.log.entry, l.fp)
	
	|Close file
	seq.close(l.fp)
	
	return(0)
}`,
  },
  {
    id: "metadata-generation",
    title: "Metadata Generation",
    prompt: "Create complete metadata for customer order processing including session, table, labels, and messages.",
    code: `| Complete Metadata Generation for Customer Order Processing
| Generated Files: Session XML, Table Definition, Labels, Messages

|=== Message File: txcus100.msg (Single-line XML) ===
<?xml version="1.0" encoding="UTF-8" standalone="no"?><DR_Message><description>Customer %1\$s not found</description><versionID>B61O_a_0091</versionID><type>message</type><name>txcus100.0001</name><Version><VersionID>B61O_a_0091</VersionID><ObjectID/><classID/><checkInLabel/><documentation>Created by LN Studio (Activity narwal, User prakhar)</documentation><isExpired>no</isExpired><isCheckedOutParallel>yes_cur_act</isCheckedOutParallel><isCheckedOut>yes</isCheckedOut><modificationDateTime>1970-01-01T00:00:00Z</modificationDateTime><modifiedBy/><creationDateTime>1970-01-01T00:00:00Z</creationDateTime><createdBy/></Version><hasHelp>2</hasHelp><severity>2</severity><MessageTranslation><description>Customer %1\$s not found</description><language>2</language></MessageTranslation><MessageTranslation><description>Klant %1\$s niet gevonden</description><language>1</language></MessageTranslation><MessageTranslation><description>Kunde %1\$s nicht gefunden</description><language>3</language></MessageTranslation><MessageTranslation><description>Cliente %1\$s no encontrado</description><language>5</language></MessageTranslation><application>EXTce01096</application><documentation/></DR_Message>

|=== Label File: txcus100.cuno.lbl (Single-line XML) ===
<?xml version="1.0" encoding="UTF-8" standalone="no"?><DR_Label><description>Customer Number</description><versionID>B61O_a_ext</versionID><type>label</type><name>txcus100.cuno</name><Version><ObjectID/><classID/><checkInLabel/><documentation/><isExpired>no</isExpired><isCheckedOutParallel>no</isCheckedOutParallel><isCheckedOut>no</isCheckedOut><modificationDateTime>1970-01-01T00:00:00Z</modificationDateTime><modifiedBy/><creationDateTime>1970-01-01T00:00:00Z</creationDateTime><createdBy/></Version><Attachment><type>techdoc</type><name>txcus100.cuno</name></Attachment><LabelVariant><keyword>CUSTOMER N</keyword><isActive>1</isActive><description>Customer Number</description><height>1</height><length>15</length><context>1</context><language>2</language></LabelVariant><LabelVariant><keyword>KLANTNUMME</keyword><isActive>1</isActive><description>Klantnummer</description><height>1</height><length>11</length><context>1</context><language>1</language></LabelVariant><LabelVariant><keyword>KUNDENNUMM</keyword><isActive>1</isActive><description>Kundennummer</description><height>1</height><length>12</length><context>1</context><language>3</language></LabelVariant><application>EXTce01096</application></DR_Label>

|=== Process Session XML Template ===
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<DR_Controller>
    <description>Customer Order Processing</description>
    <versionID>B61O_a_0091</versionID>
    <type>session</type>
    <name>txcus1100m000</name>
    <Version>
        <ObjectID/>
        <classID/>
        <checkInLabel/>
        <documentation/>
        <isExpired>no</isExpired>
        <isCheckedOutParallel>no</isCheckedOutParallel>
        <isCheckedOut>no</isCheckedOut>
        <modificationDateTime>1970-01-01T00:00:00Z</modificationDateTime>
        <modifiedBy>prakhar</modifiedBy>
        <creationDateTime>1970-01-01T00:00:00Z</creationDateTime>
        <createdBy>prakhar</createdBy>
    </Version>
    <descriptionReference>txcus1100m000</descriptionReference>
    
    <Form>
        <PhysicalFormLayout>
            <FormField>
                <uuid>1</uuid>
                <fieldName>f.customer.number</fieldName>
                <domain>tcbpid</domain>
                <fieldLabel>txcus100.cuno</fieldLabel>
                <mandatoryInput>true</mandatoryInput>
                <fieldLength>8</fieldLength>
                <sequenceNumber>1</sequenceNumber>
                <rowScreenPosition>1</rowScreenPosition>
                <columnScreenPosition>1</columnScreenPosition>
            </FormField>
            
            <FormField>
                <uuid>2</uuid>
                <fieldName>f.customer.name</fieldName>
                <domain>tcnama</domain>
                <fieldLabel>txcus100.nama</fieldLabel>
                <mandatoryInput>true</mandatoryInput>
                <fieldLength>60</fieldLength>
                <sequenceNumber>2</sequenceNumber>
                <rowScreenPosition>2</rowScreenPosition>
                <columnScreenPosition>1</columnScreenPosition>
            </FormField>
        </PhysicalFormLayout>
        
        <description>Customer Order Processing</description>
        <name>txcus1100m000d</name>
        <application>EXTce01096</application>
    </Form>
    
    <DR_Module>
        <description>Customer Order Processing</description>
        <name>txcus1100m000</name>
        <Source>
            <expression>|* 4GL Source Code for Customer Processing
#include &lt;bic_dam&gt;

table ttxcus100

long l.ret

function extern long txcus.validate.customer(
	domain	tcbpid		i.customer.number,
	domain	tcnama		i.customer.name,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.count
	
	tt.init.vars(
		l.count,
		o.error
	)
	
	|Validate customer number
	if isspace(i.customer.number) then
		mess("txcus100.0001", 1, i.customer.number)
		return(-12)
	endif
	
	|Validate customer name
	if isspace(i.customer.name) then
		mess("txcus100.0002", 1)
		return(-12)
	endif
	
	return(0)
}
</expression>
            <expressionLanguageType>Baan4C</expressionLanguageType>
            <sourceType>4</sourceType>
        </Source>
        <application>EXTce01096</application>
    </DR_Module>
    
    <application>EXTce01096</application>
</DR_Controller>

|=== Table Definition XML ===
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<DR_Table>
    <description>Customer Master Data</description>
    <versionID>B61O_a_0091</versionID>
    <type>table</type>
    <name>ttxcus100</name>
    <Version>
        <ObjectID/>
        <classID/>
        <checkInLabel/>
        <documentation/>
        <isExpired>no</isExpired>
        <isCheckedOutParallel>no</isCheckedOutParallel>
        <isCheckedOut>no</isCheckedOut>
        <modificationDateTime>1970-01-01T00:00:00Z</modificationDateTime>
        <modifiedBy>prakhar</modifiedBy>
        <creationDateTime>1970-01-01T00:00:00Z</creationDateTime>
        <createdBy>prakhar</createdBy>
    </Version>
    
    <Index>
        <description>Primary Index</description>
        <IndexColumn>
            <sortingOrder>1</sortingOrder>
            <column>cuno</column>
            <position>1</position>
        </IndexColumn>
        <isActive>true</isActive>
        <isPrimaryKey>true</isPrimaryKey>
        <isUnique>true</isUnique>
        <name>1</name>
    </Index>
    
    <Column>
        <description>Customer Number</description>
        <isNullable>false</isNullable>
        <isActive>true</isActive>
        <isMandatory>true</isMandatory>
        <position>1</position>
        <datatype>
            <Facet>
                <value>8</value>
                <type>maxLength</type>
            </Facet>
            <nativeDatatype>string</nativeDatatype>
            <name>tcbpid</name>
        </datatype>
        <name>cuno</name>
    </Column>
    
    <Column>
        <description>Customer Name</description>
        <isNullable>false</isNullable>
        <isActive>true</isActive>
        <isMandatory>true</isMandatory>
        <position>2</position>
        <datatype>
            <Facet>
                <value>60</value>
                <type>maxLength</type>
            </Facet>
            <nativeDatatype>string</nativeDatatype>
            <name>tcnama</name>
        </datatype>
        <name>nama</name>
    </Column>
    
    <DR_Module>
        <description>Customer Master Data</description>
        <name>ttxcus100</name>
        <Source>
            <expression>|* DAL Source Code for Customer Table
table ttxcus100
{
	domain	tcbpid	cuno		|Customer Number
	domain	tcnama	nama		|Customer Name
	
	index	1
	{
		cuno
	}
}
</expression>
            <expressionLanguageType>Baan4C</expressionLanguageType>
            <sourceType>12</sourceType>
        </Source>
        <application>EXTce01096</application>
    </DR_Module>
    
    <application>EXTce01096</application>
</DR_Table>

|=== 4GL Validation Function with Proper Message Usage ===
function extern long txcus.validate.customer(
	domain	tcbpid		i.customer.number,
	domain	tcnama		i.customer.name,
	domain	tccur		i.currency.code,
	domain	tcamnt		i.credit.limit,
	ref	domain	tcmcs.str999m	o.error
)
{
	long	l.ret
	long	l.count
	string	l.currency.check(3)
	
	tt.init.vars(
		l.ret,
		l.count,
		l.currency.check,
		o.error
	)
	
	|Validate mandatory customer number
	if isspace(i.customer.number) then
		mess("txcus100.0001", 1, i.customer.number)
		o.error = form.text\$("txcus100.0001")
		return(-12)
	endif
	
	|Validate mandatory customer name
	if isspace(i.customer.name) then
		mess("txcus100.0002", 1)
		o.error = form.text\$("txcus100.0002")
		return(-12)
	endif
	
	|Validate credit limit is positive
	if i.credit.limit < 0 then
		mess("txcus100.0003", 1)
		o.error = form.text\$("txcus100.0003")
		return(-12)
	endif
	
	|Validate currency code exists
	if not isspace(i.currency.code) then
		select	tcmcs003.ccur
		from	tcmcs003
		where	tcmcs003._index1 = {:i.currency.code}
		selectempty
			mess("txcus100.0004", 1, i.currency.code)
			o.error = sprintf\$(form.text\$("txcus100.0004"), i.currency.code)
			return(-12)
		endselect
	endif
	
	return(0)
}

|=== Message Code Registry ===
| txcus100.0001 - "Customer %1\$s not found"
| txcus100.0002 - "Customer name is mandatory"
| txcus100.0003 - "Credit limit must be positive"
| txcus100.0004 - "Invalid currency code: %1\$s"

|=== Label Code Registry ===
| txcus100.cuno - "Customer Number"
| txcus100.nama - "Customer Name"
| txcus100.ccur - "Currency"
| txcus100.crli - "Credit Limit"`,
  },
  {
    id: "usecases-einvoice",
    title: "E-Invoice India",
    prompt: "Generate 4GL code for e-invoice JSON format generation for Indian GST compliance.",
    code: `|#include <bic_json>
|#include <bic_http>

|E-Invoice JSON generation for Indian GST compliance
function extern long generate.einvoice.json(
	domain	tcorno			i.invoice.number,
	domain	tcmcs.str20m		i.seller.gstin,
	domain	tcmcs.str20m		i.buyer.gstin,
	domain	tcamnt			i.taxable.amount,
	ref	string			o.json.output(32000),
	ref	domain	tcmcs.str999m	o.error
)
{
    long l.ret
    long l.json.root
    long l.seller.details
    long l.buyer.details
    long l.item.list
    long l.item.object
    long l.val.details
    string l.current.date(10)
    string l.temp.string(100)
    double l.cgst.amount
    double l.sgst.amount
    double l.total.amount
    
    |MANDATORY: Initialize ALL variables
    tt.init.vars(
        l.ret,
        l.json.root,
        l.seller.details,
        l.buyer.details,
        l.item.list,
        l.item.object,
        l.val.details,
        l.current.date,
        l.temp.string,
        l.cgst.amount,
        l.sgst.amount,
        l.total.amount,
        o.json.output,
        o.error
    )
    
    |Validate mandatory fields for GST compliance
    if isspace(i.invoice.number) then
        o.error = "Invoice number is mandatory for e-invoice"
        return(-12)
    endif
    
    if isspace(i.seller.gstin) then
        o.error = "Seller GSTIN is mandatory for GST compliance"
        return(-12)
    endif
    
    if isspace(i.buyer.gstin) then
        o.error = "Buyer GSTIN is mandatory for B2B transactions"
        return(-12)
    endif
    
    |Create main JSON structure as per GST schema
    l.json.root = Json.newObject()
    if l.json.root = 0 then
        o.error = "Failed to create JSON object"
        return(-12)
    endif
    
    |Document Details - Mandatory GST fields
    Json.setString(l.json.root, "Version", "1.1")
    Json.setString(l.json.root, "TranDtls", "")
    Json.setString(l.json.root, "DocDtls", "")
    
    |Transaction Details
    l.temp.string = "1"  |Regular B2B supply
    Json.setString(l.json.root, "TaxSch", "GST")
    Json.setString(l.json.root, "SupTyp", "B2B")
    
    |Document Details
    Json.setString(l.json.root, "Typ", "INV")  |Invoice type
    Json.setString(l.json.root, "No", i.invoice.number)
    
    |Get current date in DD/MM/YYYY format
    l.current.date = date.to.string(utc.num(), "DD/MM/YYYY")
    Json.setString(l.json.root, "Dt", l.current.date)
    
    |Seller Details - Complete GST information
    l.seller.details = Json.newObject()
    Json.setString(l.seller.details, "Gstin", i.seller.gstin)
    Json.setString(l.seller.details, "LglNm", "Seller Legal Name")
    Json.setString(l.seller.details, "TrdNm", "Seller Trade Name")
    Json.setString(l.seller.details, "Addr1", "Seller Address Line 1")
    Json.setString(l.seller.details, "Addr2", "Seller Address Line 2")
    Json.setString(l.seller.details, "Loc", "Mumbai")
    Json.setString(l.seller.details, "Pin", "400001")
    Json.setString(l.seller.details, "Stcd", "27")  |Maharashtra state code
    Json.setString(l.seller.details, "Ph", "9876543210")
    Json.setString(l.seller.details, "Em", "seller@company.com")
    
    Json.set(l.json.root, "SellerDtls", l.seller.details)
    
    |Buyer Details - Complete GST information
    l.buyer.details = Json.newObject()
    Json.setString(l.buyer.details, "Gstin", i.buyer.gstin)
    Json.setString(l.buyer.details, "LglNm", "Buyer Legal Name")
    Json.setString(l.buyer.details, "TrdNm", "Buyer Trade Name")
    Json.setString(l.buyer.details, "Pos", "07")  |Place of supply
    Json.setString(l.buyer.details, "Addr1", "Buyer Address Line 1")
    Json.setString(l.buyer.details, "Addr2", "Buyer Address Line 2")
    Json.setString(l.buyer.details, "Loc", "Delhi")
    Json.setString(l.buyer.details, "Pin", "110001")
    Json.setString(l.buyer.details, "Stcd", "07")  |Delhi state code
    Json.setString(l.buyer.details, "Ph", "9876543211")
    Json.setString(l.buyer.details, "Em", "buyer@company.com")
    
    Json.set(l.json.root, "BuyerDtls", l.buyer.details)
    
    |Item List with proper GST calculations
    l.item.list = Json.newArray()
    l.item.object = Json.newObject()
    
    |Calculate GST amounts (18% = 9% CGST + 9% SGST)
    l.cgst.amount = i.taxable.amount * 0.09
    l.sgst.amount = i.taxable.amount * 0.09
    l.total.amount = i.taxable.amount + l.cgst.amount + l.sgst.amount
    
    |Item details as per GST schema
    Json.setString(l.item.object, "SlNo", "1")
    Json.setString(l.item.object, "PrdDesc", "Product Description")
    Json.setString(l.item.object, "IsServc", "N")  |Goods, not service
    Json.setString(l.item.object, "HsnCd", "1234")  |HSN code mandatory
    Json.setString(l.item.object, "Barcde", "")
    Json.setNumber(l.item.object, "Qty", 1)
    Json.setNumber(l.item.object, "FreeQty", 0)
    Json.setString(l.item.object, "Unit", "NOS")
    Json.setNumber(l.item.object, "UnitPrice", i.taxable.amount)
    Json.setNumber(l.item.object, "TotAmt", i.taxable.amount)
    Json.setNumber(l.item.object, "Discount", 0)
    Json.setNumber(l.item.object, "PreTaxVal", i.taxable.amount)
    Json.setNumber(l.item.object, "AssAmt", i.taxable.amount)
    Json.setNumber(l.item.object, "GstRt", 18)  |Total GST rate
    Json.setNumber(l.item.object, "IgstAmt", 0)  |Inter-state GST
    Json.setNumber(l.item.object, "CgstAmt", l.cgst.amount)
    Json.setNumber(l.item.object, "SgstAmt", l.sgst.amount)
    Json.setNumber(l.item.object, "CesRt", 0)  |Cess rate
    Json.setNumber(l.item.object, "CesAmt", 0)  |Cess amount
    Json.setNumber(l.item.object, "CesNonAdvlAmt", 0)
    Json.setNumber(l.item.object, "StateCesRt", 0)
    Json.setNumber(l.item.object, "StateCesAmt", 0)
    Json.setNumber(l.item.object, "StateCesNonAdvlAmt", 0)
    Json.setNumber(l.item.object, "OthChrg", 0)
    Json.setNumber(l.item.object, "TotItemVal", l.total.amount)
    
    Json.add(l.item.list, l.item.object)
    Json.set(l.json.root, "ItemList", l.item.list)
    
    |Value Details - Summary amounts for GST
    l.val.details = Json.newObject()
    Json.setNumber(l.val.details, "AssVal", i.taxable.amount)
    Json.setNumber(l.val.details, "CgstVal", l.cgst.amount)
    Json.setNumber(l.val.details, "SgstVal", l.sgst.amount)
    Json.setNumber(l.val.details, "IgstVal", 0)
    Json.setNumber(l.val.details, "CesVal", 0)
    Json.setNumber(l.val.details, "StCesVal", 0)
    Json.setNumber(l.val.details, "Discount", 0)
    Json.setNumber(l.val.details, "OthChrg", 0)
    Json.setNumber(l.val.details, "RndOffAmt", 0)
    Json.setNumber(l.val.details, "TotInvVal", l.total.amount)
    
    Json.set(l.json.root, "ValDtls", l.val.details)
    
    |Convert JSON to string for e-invoice submission
    l.ret = Json.writeString(l.json.root, o.json.output)
    if l.ret <> 0 then
        o.error = "Failed to convert JSON to string"
        Json.delete(l.json.root)
        return(-12)
    endif
    
    |Cleanup JSON objects - mandatory memory management
    Json.delete(l.json.root)
    
    return(0)
}`,
  },
  {
    id: "usecases",
    title: "GST Integration",
    prompt: "Generate code for E-Invoice GST integration for India with tax calculation and invoice validation.",
    code: `|E-Invoice GST Integration for India - Complete Implementation
|Based on E-Invoicing_GST_Integration_UseCase.md

|=== GST TAX CALCULATION ===

function long calculate.gst.tax(
	domain tcamnt01 i.taxable.amount,
	domain tcmcs.str10m i.gst.rate,
	ref domain tcamnt01 o.cgst.amount,
	ref domain tcamnt01 o.sgst.amount,
	ref domain tcamnt01 o.igst.amount,
	ref domain tcmcs.str999m o.error
)
{
	double l.gst.percentage
	double l.tax.amount
	long l.ret
	
	tt.init.vars(
		l.gst.percentage,
		l.tax.amount,
		l.ret,
		o.cgst.amount,
		o.sgst.amount,
		o.igst.amount,
		o.error
	)
	
	|Convert GST rate to percentage
	l.gst.percentage = val(i.gst.rate)
	
	if l.gst.percentage <= 0 then
		o.error = "Invalid GST rate: " & i.gst.rate
		return(-12)
	endif
	
	|Calculate total tax amount
	l.tax.amount = (i.taxable.amount * l.gst.percentage) / 100
	
	|For intra-state transactions (CGST + SGST)
	if is.intra.state.transaction() then
		o.cgst.amount = l.tax.amount / 2
		o.sgst.amount = l.tax.amount / 2
		o.igst.amount = 0
	else
		|For inter-state transactions (IGST)
		o.cgst.amount = 0
		o.sgst.amount = 0
		o.igst.amount = l.tax.amount
	endif
	
	return(0)
}

|=== E-INVOICE VALIDATION ===

function long validate.einvoice.data(
	domain tcmcs.str20m i.invoice.number,
	domain tcmcs.str15m i.gstin,
	domain tcamnt01 i.invoice.amount,
	ref domain tcmcs.str999m o.error
)
{
	tt.init.vars(o.error)
	
	|Validate invoice number format
	if isspace(i.invoice.number) then
		o.error = "Invoice number is mandatory"
		return(-12)
	endif
	
	|Validate GSTIN format (15 characters)
	if len(i.gstin) <> 15 then
		o.error = "GSTIN must be 15 characters: " & i.gstin
		return(-12)
	endif
	
	|Validate invoice amount
	if i.invoice.amount <= 0 then
		o.error = "Invoice amount must be positive"
		return(-12)
	endif
	
	|Additional GST validation rules
	if not is.valid.gstin.format(i.gstin) then
		o.error = "Invalid GSTIN format: " & i.gstin
		return(-12)
	endif
	
	return(0)
}

|=== GOVERNMENT PORTAL SUBMISSION ===

function long submit.einvoice.to.portal(
	domain tcmcs.str999m i.invoice.json,
	ref domain tcmcs.str100m o.irn.number,
	ref domain tcmcs.str999m o.error
)
{
	long l.ret
	long l.header.list
	string l.response.body(9999)
	string l.auth.token(512)
	
	tt.init.vars(
		l.ret,
		l.header.list,
		l.response.body,
		l.auth.token,
		o.irn.number,
		o.error
	)
	
	|Get authentication token
	l.ret = get.gst.portal.auth.token(l.auth.token, o.error)
	if l.ret <> 0 then
		return(-12)
	endif
	
	|Setup HTTP headers
	l.header.list = http.headerlist.new()
	http.headerlist.add(l.header.list, "Content-Type", "application/json")
	http.headerlist.add(l.header.list, "Authorization", "Bearer " & l.auth.token)
	
	|Submit to GST portal
	l.ret = http.post(
		"https://api.einvoice.gov.in/v1/invoice",
		HTTP_HEADERLIST,
		l.header.list,
		HTTP_REQUESTBODYSTRING,
		i.invoice.json,
		HTTP_RESPONSEBODYSTRING,
		l.response.body
	)
	
	if l.ret <> 0 then
		o.error = "Failed to submit e-invoice: HTTP " & str\$(l.ret)
		return(-12)
	endif
	
	|Parse response to get IRN
	l.ret = parse.einvoice.response(l.response.body, o.irn.number, o.error)
	if l.ret <> 0 then
		return(-12)
	endif
	
	return(0)
}

|=== HELPER FUNCTIONS ===

function boolean is.intra.state.transaction()
{
	|Check if buyer and seller are in same state
	|Implementation based on state codes
	return(true)  |Simplified for demo
}

function boolean is.valid.gstin.format(
	domain tcmcs.str15m i.gstin
)
{
	|Validate GSTIN checksum and format
	|First 2 chars: State code
	|Next 10 chars: PAN
	|12th char: Entity code
	|13th char: Z (default)
	|14th char: Alphanumeric
	|15th char: Check digit
	
	if len(i.gstin) <> 15 then
		return(false)
	endif
	
	|Additional format validation logic here
	return(true)
}`,
  },
  {
    id: "capabilities-overview",
    title: "Capabilities Overview",
    prompt: "Tell me everything you can do - show complete capabilities for 4GL development.",
    code: `Amazon Q Master 4GL Rules - Complete Capabilities Overview
==========================================================

🚀 CORE 4GL DEVELOPMENT
├── DAL & Table Operations
│   ├── Complete CRUD operations with validation
│   ├── Object and field hooks (before/after)
│   ├── Business methods and dependencies
│   ├── Mandatory field validation
│   └── Enum domain compliance
│
├── 4GL Script Generation
│   ├── Function creation with proper syntax
│   ├── Parameter alignment (one per line)
│   ├── Variable initialization (tt.init.vars)
│   ├── Error handling patterns
│   └── Best practices enforcement
│
└── Functions & Libraries
    ├── Trusted function usage (50+ functions)
    ├── DLL creation and usage
    ├── BOD-DLL functions
    └── Auto-function validation

🌐 API & INTEGRATION
├── LN REST API/OData
│   ├── OData schema generation
│   ├── Entity types and actions
│   ├── DLL implementation
│   └── Process session integration
│
├── REST API Integration
│   ├── HTTP methods (GET/POST/PUT/DELETE)
│   ├── OAuth2 authentication
│   ├── Bearer token management
│   └── Query parameter handling
│
└── JSON/XML Processing
    ├── JSON parsing and generation
    ├── XML parsing with namespaces
    ├── SOAP envelope handling
    └── Dynamic memory management

🔧 EXTENSIONS & CUSTOMIZATIONS
├── BOD Extensions
│   ├── Outgoing BOD extensions
│   ├── UserArea field addition
│   ├── Identifier handling
│   └── Hook extraction
│
├── Session Extensions
│   ├── Session extension development
│   ├── Menu extensions
│   ├── Report extensions
│   └── Process extensions
│
└── Public Interfaces
    ├── Sales order interfaces
    ├── Purchase order interfaces
    ├── Invoice processing
    └── Account management

📊 SPECIALIZED FEATURES
├── Reports & Analytics
│   ├── Multi-table queries
│   ├── Excel reports with colors
│   ├── Professional layouts
│   └── Performance optimization
│
├── Server SQL
│   ├── Complex SQL queries
│   ├── Performance optimization
│   ├── Company number handling
│   └── Error state management
│
└── 3GL Scripts
    ├── Process lifecycle control
    ├── Wait and activate patterns
    ├── Batch processing workflows
    └── System integration

🏗️ METADATA GENERATION
├── Tables (complete XML definitions)
├── Sessions (process session templates)
├── Labels (multi-language support)
├── Messages (error handling)
└── Questions (user interactions)

🔄 INTEGRATION POLICIES
├── API Connection Mapping
├── Endpoint Policies
│   ├── JSON to XML conversion
│   ├── XML to JSON conversion
│   ├── SOAP transformations
│   └── Error response handling
└── Special Character Handling

🇮🇳 SPECIALIZED USE CASES
├── E-invoice India (GST compliance)
├── DA Workflow integration
├── Employee ID retrieval
├── Email integration
├── Document management
└── Bearer token API integration

📋 AUTOMATIC FEATURES
├── Rule file loading (50+ files)
├── Syntax validation
├── Error prevention
├── Performance optimization
├── Memory management
├── Security best practices
└── Code review compliance

💡 KEY BENEFITS
✓ Zero hardcoded values - all parameterized
✓ One variable per line compliance
✓ Automatic error handling
✓ Enum domain validation
✓ Transaction safety
✓ Performance optimized
✓ Security compliant
✓ Best practices enforced

Just describe what you need - Amazon Q automatically:
→ Loads relevant rule files
→ Generates proper 4GL syntax
→ Includes validation & error handling
→ Follows all coding standards
→ Provides complete working solutions

Ready to accelerate your 4GL development! 🚀`,
  },
];

export default codeGenPrompts;
