/**
 * Generate a consistent avatar for a team based on their name
 * Uses team name to create deterministic colors and initials
 */
export function generateTeamAvatar(teamName: string): string {
    // Get initials (first 2 characters)
    const initials = teamName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Generate deterministic color from team name
    let hash = 0
    for (let i = 0; i < teamName.length; i++) {
        hash = teamName.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Convert to hue (0-360)
    const hue = Math.abs(hash % 360)

    // Create SVG avatar with gradient
    const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 60%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad${hash})" />
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `.trim()

    // Convert to data URL
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Get avatar URL for a team (uses stored avatar or generates new one)
 */
export function getTeamAvatar(team: { name: string; avatar?: string }): string {
    return team.avatar || generateTeamAvatar(team.name)
}
