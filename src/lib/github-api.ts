export interface GitHubNewsItem {
  number: number;
  title: string;
  body: string;
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
  state: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: Date;
  type: 'update' | 'event' | 'announcement';
  featured: boolean;
  author?: string;
  tags?: string[];
  published: boolean;
  previousVersion?: string;
  githubIssueId?: number;
}

const GITHUB_REPO = 'Nomaryth/Nomaryth';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function getTypeFromLabels(labels: Array<{ name: string }>): 'update' | 'event' | 'announcement' {
  const labelNames = labels.map(label => label.name);
  
  if (labelNames.includes('update')) return 'update';
  if (labelNames.includes('event')) return 'event';
  if (labelNames.includes('announcement')) return 'announcement';
  
  return 'announcement';
}

export async function getNewsFromGitHub(): Promise<NewsItem[]> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/issues?state=open&labels=news`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Nomaryth-Web-App'
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    } else {
      return [];
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return [];
    }

    const issues = await response.json();
    
    const filteredIssues = issues.filter((issue: any) => 
      issue.labels.some((label: any) => label.name === 'news')
    );

    return filteredIssues.map((issue: any) => ({
      id: issue.id.toString(),
      title: issue.title,
      excerpt: issue.body?.split('\n')[0] || 'Sem descrição',
      content: issue.body || '',
      date: new Date(issue.created_at),
      type: getTypeFromLabels(issue.labels),
      featured: issue.labels.some((label: any) => label.name === 'featured'),
      author: issue.user?.login || 'Unknown',
      tags: issue.labels.map((label: any) => label.name).filter((name: string) => name !== 'news'),
      published: issue.state === 'open',
      githubIssueId: issue.number
    }));
  } catch {
    return [];
  }
}


export async function closeGitHubIssue(issueNumber: number): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token not configured, cannot close issue');
    return false;
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state: 'closed' })
    });

    if (!response.ok) {
      console.error('Failed to close GitHub issue:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error closing GitHub issue:', error);
    return false;
  }
}

export async function createNewsIssue(newsData: Omit<NewsItem, 'id' | 'date'>): Promise<{ success: boolean; newIssueId?: string }> {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token not configured, cannot create news issue');
    return { success: false };
  }

  try {
    const labels = ['news', newsData.type];
    if (newsData.featured) labels.push('featured');
    if (newsData.tags) labels.push(...newsData.tags);

    const issueData = {
      title: newsData.title,
      body: `${newsData.excerpt}\n\n${newsData.content || ''}`,
      labels: labels
    };

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issueData)
    });

    if (!response.ok) {
      console.error('Failed to create GitHub issue:', response.status);
      return { success: false };
    }

    const createdIssue = await response.json();
    return { success: true, newIssueId: createdIssue.number.toString() };
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return { success: false };
  }
} 