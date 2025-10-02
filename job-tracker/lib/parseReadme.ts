export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  applicationUrl: string;
  age: string;
  category: string;
  applied?: boolean;
  appliedAt?: string; // ISO timestamp when job was marked as applied
  notSuitable?: boolean; // Whether job is marked as not suitable
}

export function parseReadme(readmeContent: string): Job[] {
  const jobs: Job[] = [];
  
  // Define categories based on the README structure
  const categories = [
    { name: 'Software Engineering', marker: '## 💻 Software Engineering Internship Roles' },
    { name: 'Product Management', marker: '## 📱 Product Management Internship Roles' },
    { name: 'Data Science, AI & Machine Learning', marker: '## 🤖 Data Science, AI & Machine Learning Internship Roles' },
    { name: 'Quantitative Finance', marker: '## 📈 Quantitative Finance Internship Roles' },
    { name: 'Hardware Engineering', marker: '## 🔧 Hardware Engineering Internship Roles' },
  ];

  let currentCategory = 'Unknown';
  const lines = readmeContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Update current category
    for (const cat of categories) {
      if (line.includes(cat.marker)) {
        currentCategory = cat.name;
        break;
      }
    }

    // Parse table rows - looking for <tr> tags
    if (line.trim().startsWith('<tr>')) {
      const rowContent: string[] = [];
      let j = i;
      
      // Collect all lines until </tr>
      while (j < lines.length && !lines[j].includes('</tr>')) {
        rowContent.push(lines[j]);
        j++;
      }
      if (j < lines.length) {
        rowContent.push(lines[j]); // Include closing </tr>
      }
      
      const fullRow = rowContent.join('\n');
      
      // Skip header rows
      if (fullRow.includes('<th>')) {
        continue;
      }

      // Extract company
      const companyMatch = fullRow.match(/<td><strong>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/strong><\/td>/);
      
      // Extract role
      const roleMatch = fullRow.match(/<td>([^<]+)<\/td>/);
      
      // Extract location (second <td> after role)
      const locationMatch = fullRow.match(/<td>([^<]+)<\/td>[^]*?<td>([^<]+)<\/td>/);
      
      // Extract application URL - first href in the Application column
      const appUrlMatch = fullRow.match(/<td><div[^>]*>(?:<[^>]*>)*<a href="([^"]+)"[^>]*><img[^>]*alt="Apply"/i);
      
      // Extract age
      const ageMatch = fullRow.match(/<td>(\d+d|N\/A|🔒)<\/td>/);

      if (companyMatch && roleMatch && locationMatch) {
        const company = companyMatch[1].trim();
        const role = roleMatch[1].trim();
        const location = locationMatch[2].trim();
        const applicationUrl = appUrlMatch ? appUrlMatch[1] : '';
        const age = ageMatch ? ageMatch[1] : 'N/A';
        
        // Create unique ID with timestamp to avoid duplicates
        const baseId = `${company}-${role}-${location}`.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
        const id = `${baseId}-${jobs.length}`;
        
        jobs.push({
          id,
          company,
          role,
          location,
          applicationUrl,
          age,
          category: currentCategory,
        });
      }

      i = j; // Skip to end of this row
    }
  }

  return jobs;
}

export async function fetchReadmeFromGitHub(): Promise<string> {
  // Use our API route to avoid CORS issues
  const response = await fetch('/api/jobs');
  
  if (!response.ok) {
    throw new Error('Failed to fetch job listings');
  }
  
  const data = await response.json();
  return data.content;
}

