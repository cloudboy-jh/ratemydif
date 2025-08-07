export interface ShareableRoast {
  content: string
  repoName?: string
  commitTitle?: string
  commitDate?: string
  type: 'main' | 'commit'
}

export function formatRoastForTwitter(roast: ShareableRoast): string {
  const maxLength = 240 // Leave room for URL and hashtags
  
  // Clean the roast content (remove HTML tags)
  const cleanContent = roast.content.replace(/<[^>]*>/g, '').trim()
  
  // Create the base tweet
  let tweetText = "🔥 Just got roasted by RateMyGit! Here's what AI thinks of my commits:\n\n"
  
  // Add context if available
  if (roast.type === 'commit' && roast.commitTitle) {
    tweetText += `"${roast.commitTitle}"\n\n`
  } else if (roast.type === 'main' && roast.repoName) {
    tweetText += `Repo: ${roast.repoName}\n\n`
  }
  
  // Calculate remaining space for roast content
  const suffix = "\n\nGet your commits roasted at ratemygit.com #GitRoast #CodeReview"
  const remainingLength = maxLength - tweetText.length - suffix.length
  
  // Truncate roast content if needed
  let roastSnippet = cleanContent
  if (roastSnippet.length > remainingLength) {
    roastSnippet = roastSnippet.substring(0, remainingLength - 3) + "..."
  }
  
  return tweetText + roastSnippet + suffix
}

export function shareToTwitter(roast: ShareableRoast): void {
  const tweetText = formatRoastForTwitter(roast)
  const encodedText = encodeURIComponent(tweetText)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
  
  window.open(twitterUrl, '_blank', 'noopener,noreferrer')
}

export async function takeScreenshot(elementId: string, filename: string = 'roast'): Promise<Blob> {
  try {
    const html2canvas = (await import('html2canvas')).default
    const element = document.getElementById(elementId)
    
    if (!element) {
      throw new Error('Element not found for screenshot')
    }
    
    // Add screenshot class to hide share buttons and optimize layout
    element.classList.add('screenshot-mode')
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      ignoreElements: (element) => {
        return element.classList.contains('no-screenshot')
      }
    })
    
    // Remove screenshot class
    element.classList.remove('screenshot-mode')
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, 'image/png', 1.0)
    })
    
  } catch (error) {
    console.error('Screenshot failed:', error)
    throw new Error('Failed to take screenshot')
  }
}

export async function downloadScreenshot(elementId: string, filename: string = 'roast'): Promise<void> {
  try {
    const blob = await takeScreenshot(elementId, filename)
    
    // Create download link
    const link = document.createElement('a')
    link.download = `${filename}-${Date.now()}.png`
    link.href = URL.createObjectURL(blob)
    link.click()
    
    // Clean up
    URL.revokeObjectURL(link.href)
    
  } catch (error) {
    console.error('Download failed:', error)
    throw new Error('Failed to download screenshot')
  }
}

// Web Share API - works great on iOS Safari for sharing images + text
export async function shareWithImage(roast: ShareableRoast, elementId: string): Promise<boolean> {
  try {
    // Check if Web Share API is supported and can share files
    if (typeof navigator === 'undefined' || !navigator.share) {
      return false
    }

    // Generate screenshot
    const imageBlob = await takeScreenshot(elementId, 'roast')
    const imageFile = new File([imageBlob], 'roast.png', { type: 'image/png' })
    
    // Prepare share text
    const shareText = formatRoastForTwitter(roast)
    
    // Try to share - some browsers don't support canShare but still support share
    const shareData = {
      title: 'My Git Roast from RateMyGit',
      text: shareText,
      files: [imageFile]
    }

    // Check if we can share files (if canShare is available)
    if (navigator.canShare && !navigator.canShare(shareData)) {
      return false
    }

    // Share with Web Share API
    await navigator.share(shareData)
    return true
  } catch (error) {
    console.error('Web Share API failed:', error)
    return false
  }
}

// Copy image to clipboard (iOS Safari supports this)
export async function copyImageToClipboard(elementId: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      return false
    }

    const imageBlob = await takeScreenshot(elementId, 'roast')
    const clipboardItem = new ClipboardItem({ 'image/png': imageBlob })
    
    await navigator.clipboard.write([clipboardItem])
    return true
  } catch (error) {
    console.error('Clipboard image copy failed:', error)
    return false
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}