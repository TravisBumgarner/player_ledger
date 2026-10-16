import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Slider from '@mui/material/Slider'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'

const MAX_ZOOM = 4

export type PortraitCropDialogProps = {
  file: Blob | null
  name: string
  saving: boolean
  error: string | null
  onCancel: () => void
  onSave: (area: Area) => void
}

export default function PortraitCropDialog({
  file,
  name,
  saving,
  error,
  onCancel,
  onSave,
}: PortraitCropDialogProps) {
  const { ledger } = useTheme().palette
  const [url, setUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  useEffect(() => {
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setArea(null)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return (
    <Dialog open={file !== null} onClose={saving ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Portrait of {name}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 4 }}>
        <Typography variant="caption">Drag to position, scroll or slide to zoom.</Typography>
        <Box sx={{ position: 'relative', height: 320 }}>
          {url ? (
            <Cropper
              image={url}
              crop={crop}
              zoom={zoom}
              maxZoom={MAX_ZOOM}
              aspect={1}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
              style={{
                containerStyle: { backgroundColor: ledger.ground },
                // The scrim outside the crop is a box-shadow in currentColor.
                cropAreaStyle: {
                  border: `1px solid ${ledger.accent}`,
                  color: alpha(ledger.ground, 0.75),
                },
              }}
            />
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <ZoomOutIcon fontSize="small" color="action" />
          <Slider
            aria-label="Zoom"
            size="small"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(_, value) => setZoom(value as number)}
          />
          <ZoomInIcon fontSize="small" color="action" />
        </Box>
        {error ? (
          <Typography variant="body2" color="error" role="alert">
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="quiet" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving || !area}
          onClick={() => {
            if (area) onSave(area)
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
