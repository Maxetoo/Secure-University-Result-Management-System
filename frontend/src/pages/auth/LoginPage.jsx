import { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, fillLoginInputs } from '../../slices/authSlice'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

const BACKEND_URL = import.meta.env.VITE_ORIGIN_URL || 'http://localhost:8080'

const LoginPage = () => {
    const dispatch = useDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const { login: loginState } = useSelector((state) => state.auth)
    const { inputs, load, error, errorMsg, successMsg } = loginState
    const { email, password } = inputs

    const oauthError = new URLSearchParams(window.location.search).get('error') === 'google'

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(login({ email, password }))
    }

    return (
        <Wrapper>
            <LogoText>UniResult</LogoText>
            <p className="header_desc">University Result Management System — sign in to continue</p>

            {(error || oauthError) && (
                <ErrorBanner>{oauthError ? 'Google sign-in failed. Please try again.' : (errorMsg || 'Invalid credentials. Please try again.')}</ErrorBanner>
            )}
            {successMsg && <SuccessBanner>{successMsg}</SuccessBanner>}

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">
                    <h3>Email</h3>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email address"
                        name="email"
                        value={email}
                        onChange={(e) => dispatch(fillLoginInputs({ name: e.target.name, value: e.target.value }))}
                        required
                    />
                </label>
                <label htmlFor="password">
                    <h3>Password</h3>
                    <PasswordWrap>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={(e) => dispatch(fillLoginInputs({ name: e.target.name, value: e.target.value }))}
                            required
                        />
                        <ToggleBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </ToggleBtn>
                    </PasswordWrap>
                </label>
                <Link to="/forgot-password">
                    <p className="forgot_password">Forgot your password?</p>
                </Link>
                <button type="submit" className={load ? 'btn_load' : ''} disabled={load}>
                    {load ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <Divider><span>or</span></Divider>

            <GoogleBtn onClick={() => { window.location.href = `${BACKEND_URL}/api/v1/auth/google` }}>
                <FcGoogle size={20} />
                Continue with Google
            </GoogleBtn>

            <p className="signup">
                New here?{' '}
                <Link to="/register"><strong>Create account</strong></Link>
            </p>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: 100vw;
    min-height: 100vh;
    padding-top: 8rem;
    padding-bottom: 6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .header_desc {
        margin-top: 0.4rem;
        color: var(--light-text-color);
        font-size: 0.95em;
    }

    form {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 1.5rem;
    }

    h3 {
        margin-top: 1rem;
        color: var(--light-text-color);
        font-size: 1em;
        font-weight: 600;
    }

    label {
        width: 100%;
    }

    input {
        width: 100%;
        height: 55px;
        padding: 0 3rem 0 1rem;
        margin-top: 0.5rem;
        border: solid 1px var(--stroke-color);
        border-radius: 10px;
        font-size: 1em;
        outline: none;
        box-sizing: border-box;
    }

    input:focus {
        border-color: var(--primary-color);
    }

    .forgot_password {
        margin-top: 1rem;
        color: var(--primary-color);
        text-decoration: underline;
        font-size: 0.9em;
    }

    a {
        width: 100%;
    }

    button[type='submit'] {
        width: 100%;
        height: 50px;
        display: grid;
        place-content: center;
        font-size: 1.1em;
        font-weight: 600;
        border: none;
        background: var(--primary-color);
        border-radius: 10px;
        color: var(--white-color);
        margin-top: 2rem;
        cursor: pointer;

        &.btn_load {
            opacity: 0.7;
            cursor: not-allowed;
        }
    }

    .signup {
        margin-top: 1.5rem;
        color: var(--light-text-color);
        font-size: 0.95em;

        a { width: auto; }
        strong { color: var(--primary-color); }
    }

    @media only screen and (min-width: 768px) {
        form { width: 60%; }
    }

    @media only screen and (min-width: 992px) {
        form { width: 38%; }
    }
`

const LogoText = styled.h1`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2.2rem;
    color: var(--primary-color);
    letter-spacing: 0.02em;
`

const ErrorBanner = styled.p`
    margin-top: 1rem;
    width: 90%;
    padding: 0.75rem 1rem;
    background: #fff0f0;
    border-left: 3px solid #dc2626;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.9em;

    @media only screen and (min-width: 768px) { width: 60%; }
    @media only screen and (min-width: 992px) { width: 38%; }
`

const SuccessBanner = styled.p`
    margin-top: 1rem;
    width: 90%;
    padding: 0.75rem 1rem;
    background: #f0fff4;
    border-left: 3px solid #16a34a;
    border-radius: 8px;
    color: #16a34a;
    font-size: 0.9em;

    @media only screen and (min-width: 768px) { width: 60%; }
    @media only screen and (min-width: 992px) { width: 38%; }
`

const PasswordWrap = styled.div`
    position: relative;
    width: 100%;
`

const ToggleBtn = styled.button`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--light-text-color);
    display: flex;
    align-items: center;
    padding: 0;
    margin-top: 0.25rem;
`

const Divider = styled.div`
    width: 90%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.25rem;
    color: var(--light-text-color);
    font-size: 0.85em;

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--stroke-color);
    }

    @media only screen and (min-width: 768px) { width: 60%; }
    @media only screen and (min-width: 992px) { width: 38%; }
`

const GoogleBtn = styled.button`
    width: 90%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 0.75rem;
    border: 1px solid var(--stroke-color);
    border-radius: 10px;
    background: white;
    font-size: 1em;
    font-weight: 500;
    color: var(--text-color);
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #f9fafb; }

    @media only screen and (min-width: 768px) { width: 60%; }
    @media only screen and (min-width: 992px) { width: 38%; }
`

export default LoginPage
