import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import {
    fetchAllUsers,
    adminEditUser,
    deleteUser,
    clearAdminNotifications,
} from '../../slices/userSlice'

const ROLE_LABELS = { student: 'Student', lecturer: 'Lecturer', admin: 'Admin' }
const ROLE_COLORS = {
    student: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
    lecturer: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
    admin: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' },
}

const BLANK_FORM = { firstName: '', lastName: '', email: '', role: 'student', matricNumber: '', level: '', staffId: '', departmentCode: '' }

const UsersPage = () => {
    const dispatch = useDispatch()
    const { user, allUsers, allUsersLoad, allUsersError, adminEdit, adminDelete } = useSelector((s) => s.user)
    const [roleFilter, setRoleFilter] = useState('')
    const [search, setSearch] = useState('')

    const [editTarget, setEditTarget] = useState(null)
    const [editForm, setEditForm] = useState(BLANK_FORM)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const role = user?.role

    useEffect(() => {
        if (role === 'admin') {
            dispatch(fetchAllUsers({ role: roleFilter || undefined, search: search || undefined }))
        }
    }, [role, roleFilter, search, dispatch])

    const openEdit = (u) => {
        dispatch(clearAdminNotifications())
        setEditTarget(u)
        setEditForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            role: u.role || 'student',
            matricNumber: u.matricNumber || '',
            level: u.level || '',
            staffId: u.staffId || '',
            departmentCode: u.department?.code || '',
        })
    }

    const closeEdit = () => {
        setEditTarget(null)
        dispatch(clearAdminNotifications())
    }

    const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleEditSubmit = (e) => {
        e.preventDefault()
        const payload = { userId: editTarget._id, ...editForm }
        if (editForm.role === 'admin') {
            delete payload.matricNumber
            delete payload.level
            delete payload.staffId
            delete payload.departmentCode
        }
        if (editForm.role === 'lecturer') {
            delete payload.matricNumber
            delete payload.level
        }
        if (editForm.role === 'student') {
            delete payload.staffId
        }
        dispatch(adminEditUser(payload)).then((res) => {
            if (res.payload?.status === 'success') closeEdit()
        })
    }

    const handleDelete = () => {
        dispatch(deleteUser({ userId: deleteTarget._id })).then((res) => {
            if (res.payload?.status === 'success') setDeleteTarget(null)
        })
    }

    if (role !== 'admin') {
        return (
            <Wrapper>
                <h1>Users</h1>
                <Placeholder>You do not have permission to view this page.</Placeholder>
            </Wrapper>
        )
    }

    return (
        <Wrapper>
            <PageHeader>
                <h1>User Management</h1>
                <Filters>
                    <input
                        type="text"
                        placeholder="Search by name, email, matric..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="student">Students</option>
                        <option value="lecturer">Lecturers</option>
                        <option value="admin">Admins</option>
                    </select>
                </Filters>
            </PageHeader>

            <Summary>{allUsers.length} user{allUsers.length !== 1 ? 's' : ''} found</Summary>

            {allUsersLoad && <StatusMsg>Loading users...</StatusMsg>}
            {allUsersError && <ErrorMsg>Failed to load users.</ErrorMsg>}

            {!allUsersLoad && allUsers.length === 0 && (
                <Placeholder>No users match your filters.</Placeholder>
            )}

            {allUsers.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Matric / Staff ID</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map((u) => (
                            <tr key={u._id}>
                                <td><strong>{u.firstName} {u.lastName}</strong></td>
                                <td>{u.email}</td>
                                <td>
                                    <RoleBadge $bg={ROLE_COLORS[u.role]?.bg} $color={ROLE_COLORS[u.role]?.color}>
                                        {ROLE_LABELS[u.role] || u.role}
                                    </RoleBadge>
                                </td>
                                <td>{u.department?.name || '—'}</td>
                                <td><code>{u.matricNumber || u.staffId || '—'}</code></td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <ActionGroup>
                                        <EditBtn onClick={() => openEdit(u)}>Edit</EditBtn>
                                        <DeleteBtn onClick={() => setDeleteTarget(u)}>Delete</DeleteBtn>
                                    </ActionGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {editTarget && (
                <Overlay onClick={closeEdit}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Edit User</h2>
                            <CloseBtn onClick={closeEdit}>✕</CloseBtn>
                        </ModalHeader>

                        {adminEdit.error && <ErrorMsg>{adminEdit.errorMsg}</ErrorMsg>}

                        <form onSubmit={handleEditSubmit}>
                            <ModalRow>
                                <ModalField>
                                    <label>First Name</label>
                                    <input name="firstName" value={editForm.firstName} onChange={handleEditChange} required />
                                </ModalField>
                                <ModalField>
                                    <label>Last Name</label>
                                    <input name="lastName" value={editForm.lastName} onChange={handleEditChange} required />
                                </ModalField>
                            </ModalRow>
                            <ModalField>
                                <label>Email</label>
                                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} required />
                            </ModalField>
                            <ModalField>
                                <label>Role</label>
                                <select name="role" value={editForm.role} onChange={handleEditChange}>
                                    <option value="student">Student</option>
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </ModalField>

                            {editForm.role === 'student' && (
                                <ModalRow>
                                    <ModalField>
                                        <label>Matric Number</label>
                                        <input name="matricNumber" value={editForm.matricNumber} onChange={handleEditChange} />
                                    </ModalField>
                                    <ModalField>
                                        <label>Level</label>
                                        <select name="level" value={editForm.level} onChange={handleEditChange}>
                                            <option value="">Select level</option>
                                            {[100, 200, 300, 400, 500].map((l) => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
                                    </ModalField>
                                </ModalRow>
                            )}

                            {editForm.role === 'lecturer' && (
                                <ModalField>
                                    <label>Staff ID</label>
                                    <input name="staffId" value={editForm.staffId} onChange={handleEditChange} />
                                </ModalField>
                            )}

                            {editForm.role !== 'admin' && (
                                <ModalField>
                                    <label>Department Code (optional)</label>
                                    <input name="departmentCode" value={editForm.departmentCode} onChange={handleEditChange} placeholder="e.g. CSC" />
                                </ModalField>
                            )}

                            <ModalActions>
                                <CancelModalBtn type="button" onClick={closeEdit}>Cancel</CancelModalBtn>
                                <SaveBtn type="submit" disabled={adminEdit.load}>
                                    {adminEdit.load ? 'Saving...' : 'Save Changes'}
                                </SaveBtn>
                            </ModalActions>
                        </form>
                    </Modal>
                </Overlay>
            )}

            {deleteTarget && (
                <Overlay onClick={() => setDeleteTarget(null)}>
                    <Modal $narrow onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Delete User</h2>
                            <CloseBtn onClick={() => setDeleteTarget(null)}>✕</CloseBtn>
                        </ModalHeader>
                        <DeleteWarning>
                            Are you sure you want to permanently delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This action cannot be undone.
                        </DeleteWarning>
                        {adminDelete.error && <ErrorMsg>{adminDelete.errorMsg}</ErrorMsg>}
                        <ModalActions>
                            <CancelModalBtn onClick={() => setDeleteTarget(null)}>Cancel</CancelModalBtn>
                            <ConfirmDeleteBtn onClick={handleDelete} disabled={adminDelete.load}>
                                {adminDelete.load ? 'Deleting...' : 'Yes, Delete'}
                            </ConfirmDeleteBtn>
                        </ModalActions>
                    </Modal>
                </Overlay>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div``

const PageHeader = styled.div`
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;
    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0; }
`

const Filters = styled.div`
    display: flex; gap: 0.75rem;
    input, select {
        height: 40px; padding: 0 0.75rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.9em; outline: none;
        transition: border-color 0.2s;
        &:focus { border-color: var(--primary-color); }
    }
    select { padding-right: 2rem; }
    input { min-width: 240px; }
`

const Summary = styled.p`font-size: 0.85rem; color: var(--light-text-color); margin-bottom: 1rem;`

const Table = styled.table`
    width: 100%; border-collapse: collapse; background: var(--white-color);
    border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    border: 1px solid var(--stroke-color);
    th, td { padding: 0.875rem 1rem; text-align: left; font-size: 0.9rem; border-bottom: 1px solid var(--stroke-color); color: var(--text-color); }
    th { background: var(--secondary-color); color: var(--light-text-color); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: rgba(99, 102, 241, 0.05); }
    code { font-family: monospace; background: rgba(255,255,255,0.07); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; color: var(--light-text-color); }
`

const RoleBadge = styled.span`
    display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px;
    font-size: 0.8rem; font-weight: 600;
    background: ${(p) => p.$bg || 'rgba(255,255,255,0.08)'};
    color: ${(p) => p.$color || 'var(--light-text-color)'};
`

const ActionGroup = styled.div`display: flex; gap: 0.4rem;`

const EditBtn = styled.button`
    padding: 0.3rem 0.7rem; background: var(--primary-color); color: white;
    border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    transition: opacity 0.2s;
    &:hover { opacity: 0.85; }
`

const DeleteBtn = styled.button`
    padding: 0.3rem 0.7rem; background: rgba(248, 113, 113, 0.12); color: var(--error-color);
    border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    transition: background 0.2s;
    &:hover { background: rgba(248, 113, 113, 0.2); }
`

const StatusMsg = styled.p`color: var(--light-text-color); padding: 2rem 0; text-align: center;`

const ErrorMsg = styled.p`
    color: var(--error-color); background: rgba(248, 113, 113, 0.1); border-left: 3px solid var(--error-color);
    padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9em;
`

const Placeholder = styled.div`
    background: var(--white-color); border-radius: 12px; padding: 4rem 2rem;
    text-align: center; color: var(--light-text-color); box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    border: 1px solid var(--stroke-color);
`

const Overlay = styled.div`
    position: fixed; inset: 0; background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 1rem; backdrop-filter: blur(3px);
`

const Modal = styled.div`
    background: var(--white-color); border-radius: 14px; padding: 1.75rem;
    width: 100%; max-width: ${(p) => p.$narrow ? '420px' : '560px'};
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid var(--stroke-color);
    max-height: 90vh; overflow-y: auto;

    input, select {
        width: 100%; padding: 0.55rem 0.85rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.9em; outline: none;
        box-sizing: border-box; transition: border-color 0.2s;
        &:focus { border-color: var(--primary-color); }
    }
    select { padding-right: 2rem; }
`

const ModalHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;
    h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-color); margin: 0; }
`

const CloseBtn = styled.button`
    background: none; border: none; font-size: 1rem; cursor: pointer;
    color: var(--light-text-color); padding: 0.2rem 0.4rem;
    &:hover { color: var(--text-color); }
`

const ModalRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;`

const ModalField = styled.div`
    display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem;
    label { font-size: 0.8rem; font-weight: 600; color: var(--light-text-color); }
`

const ModalActions = styled.div`display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;`

const CancelModalBtn = styled.button`
    padding: 0.55rem 1.25rem; border: 1px solid var(--stroke-color);
    background: transparent; border-radius: 8px; cursor: pointer; font-size: 0.9em;
    color: var(--text-color); transition: background 0.2s;
    &:hover { background: rgba(99, 102, 241, 0.08); }
`

const SaveBtn = styled.button`
    padding: 0.55rem 1.5rem; background: var(--primary-color); color: white;
    border: none; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer;
    transition: opacity 0.2s;
    &:disabled { opacity: 0.7; cursor: not-allowed; }
`

const DeleteWarning = styled.p`
    font-size: 0.95rem; color: var(--text-color); line-height: 1.5; margin-bottom: 1rem;
`

const ConfirmDeleteBtn = styled.button`
    padding: 0.55rem 1.5rem; background: #ef4444; color: white;
    border: none; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer;
    transition: background 0.2s;
    &:disabled { opacity: 0.7; cursor: not-allowed; }
    &:hover:not(:disabled) { background: #dc2626; }
`

export default UsersPage
