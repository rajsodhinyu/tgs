import {useCallback, useState} from 'react'
import {getImageDimensions} from '@sanity/asset-utils'
import styled from 'styled-components'

const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #991b1b;
`

export function CroppedImageInput(props: any) {
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback(
    (patchEvent: any) => {
      const patches = patchEvent.patches || patchEvent
      const assetPatches = Array.isArray(patches) ? patches : [patches]

      for (const patch of assetPatches) {
        const ref = patch?.value?.asset?._ref
        if (ref) {
          const {width, height} = getImageDimensions(ref)
          const actual = width / height
          const title = props.schemaType?.title || 'Image'
          if (title === 'Thumbnail' && Math.abs(actual - 1) > 0.05) {
            setError(`Thumbnail must be square. Uploaded image is ${width}×${height}.`)
            return
          }
          if (title === 'Banner (shown if no video)' && Math.abs(actual - 16 / 9) > 0.05) {
            setError(`Banner must be 16:9. Uploaded image is ${width}×${height}.`)
            return
          }
        }
      }

      setError(null)
      props.onChange(patchEvent)
    },
    [props.onChange, props.schemaType?.title],
  )

  return (
    <div>
      {props.renderDefault({...props, onChange: handleChange})}
      {error && <ErrorBanner>{error}</ErrorBanner>}
    </div>
  )
}
