import { useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { updatePassword } from '../../slices/authSlice'

const AccountSettingsPage = () => {
    const dispatch = useDispatch()
    const { updatePassword: upState } = useSelector((store) => store.auth)

    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (form.newPassword !== form.confirmNewPassword) {
            toast.error('New passwords do not match')
            return
        }
        dispatch(updatePassword({ currentPassword: form.oldPassword, newPassword: form.newPassword }))
            .then((result) => {
                if (result.payload?.status === 'success') {
                    toast.success(result.payload.response?.message || 'Password updated successfully')
                    setForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' })
                } else {
                    toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to update password')
                }
            })
    }

    return (
        <Wrapper>
            <PageHeader>
                <h1>Account Settings</h1>
            </PageHeader>

            <Card>
                <SectionTitle>Change Password</SectionTitle>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <label>Current Password</label>
                        <input
                            type="password"
                            placeholder="Current password"
                            value={form.oldPassword}
                            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="New password"
                            value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={form.confirmNewPassword}
                            onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <SubmitButton type="submit" disabled={upState.load}>
                        {upState.load ? 'Updating...' : 'Update Password'}
                    </SubmitButton>
                </form>
            </Card>
        </Wrapper>
    )
}

const Wrapper = styled.div``

const PageHeader = styled.div`
    margin-bottom: 2rem;

    h1 {
        font-size: 1.5rem;
        color: var(--text-color);
        margin: 0;
    }
`

const Card = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
    max-width: 540px;
`

const SectionTitle = styled.h2`
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 1.5rem;
`

const FormGroup = styled.div`
    margin-bottom: 1.25rem;

    label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--light-text-color);
        margin-bottom: 0.4rem;
    }

    input {
        width: 100%;
        height: 55px;
        padding: 0 1rem;
        border: 1px solid var(--stroke-color);
        border-radius: 10px;
        font-size: 1em;
        outline: none;
        box-sizing: border-box;

        &:focus {
            border-color: var(--primary-color);
        }
    }
`

const SubmitButton = styled.button`
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    background: var(--primary-color);
    color: var(--white-color);
    margin-top: 0.5rem;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`

export default AccountSettingsPage
