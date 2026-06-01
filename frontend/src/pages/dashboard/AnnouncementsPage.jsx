import styled from 'styled-components'

const AnnouncementsPage = () => (
    <Wrapper>
        <h1>Announcements</h1>
        <Placeholder>No announcements at this time.</Placeholder>
    </Wrapper>
)

const Wrapper = styled.div`
    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0 0 1.5rem; }
`

const Placeholder = styled.div`
    background: white; border-radius: 12px; padding: 4rem 2rem;
    text-align: center; color: var(--light-text-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`

export default AnnouncementsPage
