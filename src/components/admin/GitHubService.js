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
    return {
      content: atob(data.content),
      sha: data.sha,
    };
  }

  async updateFile(path, content, message) {
    // Get current file SHA
    const existing = await this.getFile(path);
    const body = {
      message: message || `Update ${path} via Admin Panel`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: BRANCH,
    };
    if (existing) {
      body.sha = existing.sha;
    }

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

  async uploadImage(file, folder = "public/data/images") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(",")[1];
          const path = `${folder}/${file.name}`;

          const existing = await this.getFile(path);
          const body = {
            message: `Upload image: ${file.name}`,
            content: base64,
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
            throw new Error(err.message);
          }

          resolve(`/data/images/${file.name}`);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async triggerDeploy() {
    // Netlify auto-deploys on push, no extra trigger needed
    return true;
  }
}

export default GitHubService;
