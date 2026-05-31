import {useCallback} from 'react'
import {set} from 'sanity'
import {ColorInput} from '@sanity/color-input'
import styled, {createGlobalStyle} from 'styled-components'

/**
 * Wraps the @sanity/color-input picker and adds, in one compact row:
 *  - an eyedropper (browser EyeDropper API) to grab a pixel from anywhere
 *    on screen (e.g. the post's banner / thumbnail)
 *  - a live sample of white body text over the chosen color, in the site's
 *    body font, to sanity-check contrast before readers ever see it
 */

/** Load the site's body font (Roc Grotesk Variable) so the sample matches it. */
const BodyFontFace = createGlobalStyle`
  @font-face {
    font-family: 'Roc Grotesk Variable Studio';
    src: url('/static/fonts/roc-grotesk-variable.ttf') format('truetype');
    font-weight: 100 900;
    font-display: swap;
  }
`

type Rgb = {r: number; g: number; b: number}

function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  const num = parseInt(h, 16)
  return {r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255}
}

function rgbToHsl({r, g, b}: Rgb) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return {h, s, l}
}

function rgbToHsv({r, g, b}: Rgb) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  const v = max
  let h = 0
  if (d !== 0) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return {h, s, v}
}

/** Build the full @sanity/color-input value object from a bare hex. */
function colorValueFromHex(hex: string) {
  const rgb = hexToRgb(hex)
  return {
    _type: 'color',
    hex,
    alpha: 1,
    hsl: {...rgbToHsl(rgb), a: 1},
    hsv: {...rgbToHsv(rgb), a: 1},
    rgb: {...rgb, a: 1},
  }
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Row = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.6rem;
`

const PickBtn = styled.button`
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--card-border-color, #e3e4e8);
  background: var(--card-bg-color, #fff);
  color: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Sample = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
`

const SampleText = styled.div`
  font-family: 'Roc Grotesk Variable Studio', system-ui, sans-serif;
  font-weight: 280;
  color: #fff;
  font-size: 1.05rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function EyedropperIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  )
}

export function BgColorInput(props: any) {
  const {value, onChange} = props

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

  const pick = useCallback(async () => {
    const Ctor = (window as any).EyeDropper
    if (!Ctor) return
    try {
      const {sRGBHex} = await new Ctor().open()
      onChange(set(colorValueFromHex(sRGBHex)))
    } catch {
      /* user cancelled */
    }
  }, [onChange])

  const hex = value?.hex || '#191A24'

  return (
    <Wrap>
      <BodyFontFace />
      <ColorInput {...props} />

      <Row>
        <PickBtn type="button" onClick={pick} disabled={!hasEyeDropper}>
          <EyedropperIcon />
          {hasEyeDropper ? 'Grab a color' : 'Eyedropper unsupported in this browser'}
        </PickBtn>

        <Sample style={{background: hex}}>
          <SampleText>Sample article text</SampleText>
        </Sample>
      </Row>
    </Wrap>
  )
}
