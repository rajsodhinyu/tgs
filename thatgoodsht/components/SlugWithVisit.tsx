import {SlugInput, useFormValue, useDocumentOperation} from 'sanity'
import {useCallback} from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const VisitButton = styled.a<{$disabled?: boolean}>`
  display: inline-flex;
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

const ToggleWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  user-select: none;
`

const Track = styled.div<{$isPublic: boolean}>`
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: ${(p) => (p.$isPublic ? '#2ecc40' : '#ccc')};
  position: relative;
  transition: background 0.2s;
`

const Thumb = styled.div<{$isPublic: boolean}>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: ${(p) => (p.$isPublic ? '18px' : '2px')};
  transition: left 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`

export function SlugWithVisit(props: any) {
  const {value} = props
  const slug = value?.current
  const url = slug ? `https://thatgoodsht.com/blog/post/${slug}` : null

  const isPrivate = useFormValue(['private'])
  const documentId = useFormValue(['_id']) as string
  const cleanId = documentId?.replace('drafts.', '')
  const {patch} = useDocumentOperation(cleanId, 'post')

  const toggleVisibility = useCallback(() => {
    patch.execute([{set: {private: !isPrivate}}])
  }, [isPrivate, patch])

  return (
    <Wrapper>
      <SlugInput {...props} />
      <ButtonRow>
        <VisitButton href={url || '#'} target="_blank" rel="noopener noreferrer" $disabled={!slug}>
          Visit ↗
        </VisitButton>
        <ToggleWrapper onClick={toggleVisibility}>
          <Track $isPublic={!isPrivate}>
            <Thumb $isPublic={!isPrivate} />
          </Track>
          {isPrivate ? '🔒 Direct Link only' : '🌐 Public'}
        </ToggleWrapper>
      </ButtonRow>
    </Wrapper>
  )
}
