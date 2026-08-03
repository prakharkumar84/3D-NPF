// GitHub API Service for direct repo updates
const REPO_OWNER = "prakharkumar84";
const REPO_NAME = "3D-NPF";
const BRANCH = "main";

class GitHubService {
  constructor(token) {
    this.token = token;
    this.baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  }

  async getFile(path) {
    const res = await fetch(`${this.baseUrl}/contents/${path}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${this.token}` },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const data = await res.json();
    // Only decode text content, skip for binary files
    let decoded = null;
    try {
      decoded = decodeURIComponent(
        escape(atob(data.content.replace(/\n/g, "")))
      );
    } catch {
      // Binary file - can't decode as text
    }
    return { content: decoded, sha: data.sha };
  }

  async updateFile(path, content, message) {
    const existing = await this.getFile(path);
    const body = {
      message: message || `Update ${path} via Admin Panel`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: BRANCH,
    };
    if (existing) body.sha = existing.sha;

    const res = await fetch(`${this.baseUrl}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Failed to update ${path}`);
    }
    return await res.json();
  }

  async uploadImage(file, folder = "src/assets") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const path = `${folder}/${file.name}`;

          // Check if file already exists to get SHA
          let sha = null;
          try {
            const res = await fetch(
              `${this.baseUrl}/contents/${path}?ref=${BRANCH}`,
              { headers: { Authorization: `token ${this.token}` } }
            );
            if (res.ok) {
              const data = await res.json();
              sha = data.sha;
            }
          } catch {
            // File doesn't exist, that's fine
          }

          const body = {
            message: `Upload image: ${file.name}`,
            content: base64,
            branch: BRANCH,
          };
          if (sha) body.sha = sha;

          const res = await fetch(`${this.baseUrl}/contents/${path}`, {
            method: "PUT",
            headers: {
              Authorization: `token ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(
              `${res.status}: ${err.message || JSON.stringify(err)}`
            );
          }
          resolve(file.name);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default GitHubService;
