"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2, Twitter, Camera, Loader2, Check, Copy, Download } from "lucide-react"
import { 
  shareToTwitter, 
  shareWithImage, 
  copyImageToClipboard, 
  downloadScreenshot, 
  type ShareableRoast 
} from "@/lib/share-utils"

interface ShareRoastButtonProps {
  roast: ShareableRoast
  screenshotElementId: string
  className?: string
}

export function ShareRoastButton({ roast, screenshotElementId, className }: ShareRoastButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check if Web Share API is available (iOS Safari supports this)
  const canShareFiles = typeof navigator !== 'undefined' && !!navigator.share

  const handleShareWithImage = async () => {
    setIsLoading(true)
    setLastAction('share-image')
    setSuccess(false)
    
    try {
      const shared = await shareWithImage(roast, screenshotElementId)
      if (shared) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        // Fallback to Twitter text-only share
        shareToTwitter(roast)
      }
    } catch (error) {
      console.error('Share with image failed:', error)
      // Fallback to Twitter text-only share
      shareToTwitter(roast)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterShare = () => {
    try {
      shareToTwitter(roast)
    } catch (error) {
      console.error('Twitter share failed:', error)
    }
  }

  const handleCopyImage = async () => {
    setIsLoading(true)
    setLastAction('copy-image')
    setSuccess(false)
    
    try {
      const copied = await copyImageToClipboard(screenshotElementId)
      if (copied) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Copy image failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadScreenshot = async () => {
    setIsLoading(true)
    setLastAction('download')
    setSuccess(false)
    
    try {
      const filename = roast.type === 'commit' 
        ? `commit-roast-${roast.commitTitle?.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}`
        : `repo-roast-${roast.repoName?.replace(/[^a-zA-Z0-9]/g, '-')}`
      
      await downloadScreenshot(screenshotElementId, filename)
      setSuccess(true)
      
      // Reset success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      console.error('Screenshot failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 ${className || ''}`}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* iOS Safari - Share with image and text */}
        {canShareFiles && (
          <DropdownMenuItem 
            onClick={handleShareWithImage} 
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading && lastAction === 'share-image' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : success && lastAction === 'share-image' ? (
              <Check className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            {isLoading && lastAction === 'share-image'
              ? 'Preparing Share...' 
              : success && lastAction === 'share-image'
                ? 'Shared Successfully!' 
                : 'Share Image & Text'
            }
          </DropdownMenuItem>
        )}
        
        {/* Twitter text-only fallback */}
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2" />
          Share Text to X/Twitter
        </DropdownMenuItem>
        
        {/* Copy image to clipboard */}
        <DropdownMenuItem 
          onClick={handleCopyImage} 
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading && lastAction === 'copy-image' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : success && lastAction === 'copy-image' ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {isLoading && lastAction === 'copy-image'
            ? 'Copying Image...' 
            : success && lastAction === 'copy-image'
              ? 'Copied to Clipboard!' 
              : 'Copy Image'
          }
        </DropdownMenuItem>
        
        {/* Download screenshot */}
        <DropdownMenuItem 
          onClick={handleDownloadScreenshot} 
          disabled={isLoading}
          className="cursor-pointer"
        >
          {isLoading && lastAction === 'download' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : success && lastAction === 'download' ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isLoading && lastAction === 'download'
            ? 'Downloading...' 
            : success && lastAction === 'download'
              ? 'Downloaded!' 
              : 'Download Image'
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}