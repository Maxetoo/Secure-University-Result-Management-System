import { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, fillRegisterInputs } from '../../slices/authSlice'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

const BACKEND_URL = import.meta.env.VITE_ORIGIN_URL || 'http://localhost:8080'

const SignUpPage = () => {
    const dispatch = useDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const { register: regState } = useSelector((state) => state.auth)
    const { inputs, load, error, errorMsg, successMsg } = regState
    const { role } = inputs

    const handleChange = (e) => {
        dispatch(fillRegisterInputs({ name: e.target.name, value: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const payload = {
            firstName: inputs.firstName,
            lastName: inputs.lastName,
            email: inputs.email,
            password: inputs.password,
            role: inputs.role,
        }
        if (role === 'student') {
            payload.matricNumber = inputs.matricNumber
            payload.level = inputs.level
            if (inputs.departmentCode) payload.departmentCode = inputs.departmentCode
        }
        if (role === 'lecturer') {
            payload.staffId = inputs.staffId
            if (inputs.departmentCode) payload.departmentCode = inputs.departmentCode
        }
        dispatch(register(payload))
    }

    return (
        <Wrapper>
            <LogoText>UniResult</LogoText>
            <h2>Create Account</h2>

            {error && <ErrorBanner>{errorMsg || 'An error occurred'}</ErrorBanner>}
            {successMsg && (
                <SuccessBanner>
                    {successMsg} — <Link to="/login">Sign in</Link>
                </SuccessBanner>
            )}

            <form onSubmit={handleSubmit}>
                <Row>
                    <label>
                        <h3>First Name</h3>
                        <input type="text" placeholder="First name" name="firstName" value={inputs.firstName} onChange={handleChange} required />
                    </label>
                    <label>
                        <h3>Last Name</h3>
                        <input type="text" placeholder="Last name" name="lastName" value={inputs.lastName} onChange={handleChange} required />
                    </label>
                </Row>

                <label>
                    <h3>Email</h3>
                    <input type="email" placeholder="Email address" name="email" value={inputs.email} onChange={handleChange} required />
                </label>

                <label>
                    <h3>Role</h3>
                    <select name="role" value={role} onChange={handleChange}>
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                    </select>
                </label>

                {role === 'student' && (
                    <>
                        <label>
                            <h3>Matric Number</h3>
                            <input type="text" placeholder="e.g. VUG/CSC/22/7410" name="matricNumber" value={inputs.matricNumber} onChange={handleChange} required />
                        </label>
                        <Row>
                            <label>
                                <h3>Level</h3>
                                <select name="level" value={inputs.level} onChange={handleChange} required>
                                    <option value="">Select level</option>
                                    {[100, 200, 300, 400, 500, 600].map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <h3>Dept. Code (optional)</h3>
                                <input type="text" placeholder="e.g. CSC" name="departmentCode" value={inputs.departmentCode} onChange={handleChange} />
                            </label>
                        </Row>
                    </>
                )}

                {role === 'lecturer' && (
                    <Row>
                        <label>
                            <h3>Staff ID</h3>
                            <input type="text" placeholder="e.g. STAFF001" name="staffId" value={inputs.staffId} onChange={handleChange} required />
                        </label>
                        <label>
                            <h3>Dept. Code (optional)</h3>
                            <input type="text" placeholder="e.g. CSC" name="departmentCode" value={inputs.departmentCode} onChange={handleChange} />
                        </label>
                    </Row>
                )}

                <label>
                    <h3>Password</h3>
                    <PasswordWrap>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 8 characters"
                            name="password"
                            value={inputs.password}
                            onChange={handleChange}
                            required
                        />
                        <ToggleBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </ToggleBtn>
                    </PasswordWrap>
                </label>

                <button type="submit" className={load ? 'btn_load' : ''} disabled={load}>
                    {load ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <Divider><span>or</span></Divider>

            <GoogleBtn onClick={() => { window.location.href = `${BACKEND_URL}/api/v1/auth/google` }}>
                <FcGoogle size={20} />
                Continue with Google
            </GoogleBtn>

            <p className="login">
                Already have an account?{' '}
                <Link to="/login"><strong>Sign In</strong></Link>
            </p>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: 100vw;
    min-height: 100vh;
    padding: 4rem 0 6rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
        margin-top: 0.25rem;
        font-size: 1.5rem;
        color: var(--text-color);
    }

    form {
        width: 90%;
        display: flex;
        flex-direction: column;
        margin-top: 1.5rem;
    }

    h3 {
        margin-top: 1rem;
        color: var(--light-text-color);
        font-size: 0.95em;
        font-weight: 600;
    }

    label { width: 100%; }

    input, select {
        width: 100%;
        height: 50px;
        padding: 0 1rem;
        margin-top: 0.5rem;
        border: solid 1px var(--stroke-color);
        border-radius: 10px;
        font-size: 1em;
        outline: none;
        box-sizing: border-box;
        background-color: white;
    }

    select { padding-right: 2rem; }

    input:focus, select:focus { border-color: var(--primary-color); }

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

        &.btn_load { opacity: 0.7; cursor: not-allowed; }
    }

    .login {
        margin-top: 1.5rem;
        color: var(--light-text-color);
        font-size: 0.95em;
        strong { color: var(--primary-color); }
        a { text-decoration: none; }
    }

    @media only screen and (min-width: 768px) { form { width: 60%; } }
    @media only screen and (min-width: 992px) { form { width: 42%; } }
`

const LogoText = styled.h1`
    font-family: 'Cinzel Decorative', serif;
    font-size: 2rem;
    color: var(--primary-color);
    letter-spacing: 0.02em;
    margin-bottom: 0.25rem;
`

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`

const PasswordWrap = styled.div`
    position: relative;
    input { padding-right: 3rem; }
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
    @media only screen and (min-width: 992px) { width: 42%; }
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
    a { color: #16a34a; font-weight: 600; }
    @media only screen and (min-width: 768px) { width: 60%; }
    @media only screen and (min-width: 992px) { width: 42%; }
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
    @media only screen and (min-width: 992px) { width: 42%; }
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
    @media only screen and (min-width: 992px) { width: 42%; }
`

export default SignUpPage
