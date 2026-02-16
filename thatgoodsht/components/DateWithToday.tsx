import {useCallback} from 'react'
import {set} from 'sanity'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TodayButton = styled.button`
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: none;
  background: #6c5cbe;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #5a4aad;
  }
`

export function DateWithToday(props: any) {
  const {renderDefault, onChange} = props

  const setToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    onChange(set(today))
  }, [onChange])

  return (
    <Wrapper>
      {renderDefault(props)}
      <TodayButton type="button" onClick={setToday}>
        Set to Today
      </TodayButton>
    </Wrapper>
  )
}
