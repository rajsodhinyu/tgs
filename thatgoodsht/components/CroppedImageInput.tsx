import {ImageInput} from 'sanity'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: relative;
`

const StatusBadge = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  z-index: 1;
`

export function CroppedImageInput(props: any) {
  const {value} = props
  const hasCrop = value?.crop

  return (
    <Wrapper>
      {value?.asset && !hasCrop && <StatusBadge>⚠️ Needs crop</StatusBadge>}
      <ImageInput {...props} />
    </Wrapper>
  )
}
