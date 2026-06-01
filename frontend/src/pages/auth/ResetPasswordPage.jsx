import { useState } from 'react'
import styled from 'styled-components'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '../../slices/authSlice'
import { ErrorNotificationPopup, SuccessNotificationPopup } from '../../helpers'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const { resetPassword: rpState } = useSelector((state) => state.auth)
    const { load, error, successMsg, errorMsg } = rpState
    const dispatch = useDispatch()

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(resetPassword({ token, newPassword, confirmPassword }))
    }

    return (
        <Wrapper>
            <h1>Reset Password</h1>
            <ErrorNotificationPopup trigger={error} message={errorMsg || 'An error occurred'} />
            <SuccessNotificationPopup trigger={!!successMsg} message={successMsg} />
            <p className="header_desc">Please enter your new password below.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="new-password">
                    <h3>New Password</h3>
                    <input
                        type="password"
                        id="new-password"
                        placeholder="New password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </label>
                <label htmlFor="confirm-password">
                    <h3>Confirm Password</h3>
                    <input
                        type="password"
                        id="confirm-password"
                        placeholder="Confirm password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>
                <button type="submit" className={load ? 'btn_load' : ''}>
                    Reset Password
                </button>
            </form>

            <Link to="/login">
                <p className="back_to_login">Back to Login</p>
            </Link>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: 100vw;
    margin-top: 9rem;
    padding-bottom: 8em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .header_desc {
        width: 80%;
        margin-top: 1rem;
        color: var(--light-text-color);
        text-align: center;
    }

    form {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    h3 {
        margin-top: 2rem;
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
        padding: 0 2rem 0 1rem;
        margin-top: 0.5rem;
        border: solid 1px var(--stroke-color);
        border-radius: 10px;
        font-size: 1em;
        outline: none;
    }

    input:focus,
    select:focus,
    textarea:focus {
        border-color: var(--primary-color);
    }

    button {
        width: 100%;
        height: 50px;
        display: grid;
        place-content: center;
        font-size: 1.2em;
        border: none;
        background: var(--primary-color);
        border-radius: 10px;
        color: var(--white-color);
        margin-top: 2rem;
        cursor: pointer;
    }

    a {
        margin-top: 2rem;
        color: var(--primary-color);
    }

    .btn_load {
        opacity: 0.7;
    }

    @media only screen and (min-width: 768px) {
        .header_desc {
            width: 50%;
        }

        form {
            width: 60%;
        }
    }

    @media only screen and (min-width: 992px) {
        padding-bottom: 10em;

        .header_desc {
            width: 30%;
        }

        form {
            width: 40%;
        }
    }
`

export default ResetPasswordPage
