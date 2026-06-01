import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const AuthCallbackPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const accessToken = params.get('accessToken')
        const refreshToken = params.get('refreshToken')
        const error = params.get('error')

        if (error || !accessToken) {
            navigate('/login?error=google', { replace: true })
            return
        }

        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

        window.location.replace('/dashboard')
    }, [navigate])

    return (
        <Wrapper>
            <Spinner />
            <p>Signing you in…</p>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--light-text-color);
    font-size: 1rem;
`

const Spinner = styled.div`
    width: 36px;
    height: 36px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.75s linear infinite;

    @keyframes spin { to { transform: rotate(360deg); } }
`

export default AuthCallbackPage
