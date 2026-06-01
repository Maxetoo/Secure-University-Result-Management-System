import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { updateProfile } from '../../slices/userSlice'
import { fetchDepartments } from '../../slices/departmentSlice'

const LEVELS = [100, 200, 300, 400, 500, 600]

const ProfileSettingsPage = () => {
    const dispatch = useDispatch()
    const { user, updateProfile: upState } = useSelector((store) => store.user)
    const { departments } = useSelector((store) => store.department)
    const isStudent = user?.role === 'student'

    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        matricNumber: user?.matricNumber || '',
        level: user?.level || '',
        departmentCode: user?.department?.code || '',
    })

    useEffect(() => {
        if (isStudent && departments.length === 0) {
            dispatch(fetchDepartments())
        }
    }, [isStudent])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!user?._id) return
        const payload = {
            userId: user._id,
            firstName: form.firstName,
            lastName: form.lastName,
        }
        if (isStudent) {
            payload.matricNumber = form.matricNumber
            payload.level = form.level
            payload.departmentCode = form.departmentCode
        }
        dispatch(updateProfile(payload)).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Profile updated successfully')
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to update profile')
            }
        })
    }

    return (
        <Wrapper>
            <PageHeader>
                <h1>Profile Settings</h1>
            </PageHeader>

            <Card>
                <form onSubmit={handleSubmit}>
                    <ReadOnlyGroup>
                        <label>Email (cannot be changed)</label>
                        <ReadOnlyInput value={user?.email || ''} readOnly />
                    </ReadOnlyGroup>

                    <FormGroup>
                        <label>First Name</label>
                        <input
                            type="text"
                            placeholder="First name"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Last Name</label>
                        <input
                            type="text"
                            placeholder="Last name"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </FormGroup>

                    {isStudent && (
                        <>
                            <FormGroup>
                                <label>Matric Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. VUG/CSC/22/7410"
                                    value={form.matricNumber}
                                    onChange={(e) => setForm({ ...form, matricNumber: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup>
                                <label>Level</label>
                                <select
                                    value={form.level}
                                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                                >
                                    <option value="">Select level</option>
                                    {LEVELS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </FormGroup>

                            <FormGroup>
                                <label>Department</label>
                                <select
                                    value={form.departmentCode}
                                    onChange={(e) => setForm({ ...form, departmentCode: e.target.value })}
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d) => (
                                        <option key={d._id} value={d.code}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </FormGroup>
                        </>
                    )}

                    <SubmitButton type="submit" disabled={upState.load}>
                        {upState.load ? 'Saving...' : 'Save Changes'}
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    max-width: 540px;
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

    input, select {
        width: 100%;
        height: 55px;
        padding: 0 1rem;
        border: 1px solid var(--stroke-color);
        border-radius: 10px;
        font-size: 1em;
        outline: none;
        box-sizing: border-box;
        background: var(--white-color);
        color: var(--text-color);

        &:focus {
            border-color: var(--primary-color);
        }
    }

    select { padding-right: 2rem; }
`

const ReadOnlyGroup = styled.div`
    margin-bottom: 1.25rem;

    label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--light-text-color);
        margin-bottom: 0.4rem;
    }
`

const ReadOnlyInput = styled.input`
    width: 100%;
    height: 55px;
    padding: 0 1rem;
    border: 1px solid var(--stroke-color);
    border-radius: 10px;
    font-size: 1em;
    outline: none;
    box-sizing: border-box;
    background: #f9fafb;
    color: var(--light-text-color);
    cursor: not-allowed;
`

const HintText = styled.p`
    font-size: 0.78rem;
    color: var(--light-text-color);
    margin-top: 0.3rem;
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

export default ProfileSettingsPage
