import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const VisitButton = styled.a<{$disabled?: boolean}>`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  background: ${(p) => (p.$disabled ? '#d0d0d0' : '#6c5cbe')};
  color: ${(p) => (p.$disabled ? '#999' : '#fff')};
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  pointer-events: ${(p) => (p.$disabled ? 'none' : 'auto')};
  &:hover {
    background: ${(p) => (p.$disabled ? '#d0d0d0' : '#5a4aad')};
  }
`

export function UrlWithVisit(props: any) {
  const {value} = props

  return (
    <Wrapper>
      {props.renderDefault(props)}
      <VisitButton href={value || '#'} target="_blank" rel="noopener noreferrer" $disabled={!value}>
        Visit ↗
      </VisitButton>
    </Wrapper>
  )
}
