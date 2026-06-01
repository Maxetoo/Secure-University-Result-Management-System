import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiRefreshCw } from 'react-icons/fi'
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../slices/departmentSlice'

const PAGE_SIZE = 12

const DepartmentsPage = () => {
    const dispatch = useDispatch()
    const { departments, fetchLoad, createLoad, updateLoad, deleteLoad } = useSelector((store) => store.department)

    const [showCreate, setShowCreate] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedDept, setSelectedDept] = useState(null)
    const [form, setForm] = useState({ name: '', code: '', description: '' })

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        dispatch(fetchDepartments())
    }, [dispatch])

    const refresh = () => dispatch(fetchDepartments())

    const filtered = useMemo(() => {
        if (!search) return departments
        const q = search.toLowerCase()
        return departments.filter((d) =>
            d.name?.toLowerCase().includes(q) ||
            d.code?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
        )
    }, [departments, search])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)


    const handleCreate = (e) => {
        e.preventDefault()
        dispatch(createDepartment(form)).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Department created')
                setShowCreate(false)
                setForm({ name: '', code: '', description: '' })
                dispatch(fetchDepartments())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to create department')
            }
        })
    }

    const handleEdit = (e) => {
        e.preventDefault()
        dispatch(updateDepartment({ departmentId: selectedDept._id, ...form })).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Department updated')
                setShowEdit(false)
                dispatch(fetchDepartments())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to update department')
            }
        })
    }

    const handleDelete = () => {
        dispatch(deleteDepartment({ departmentId: selectedDept._id })).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success('Department deleted')
                setShowDeleteConfirm(false)
                dispatch(fetchDepartments())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to delete department')
            }
        })
    }

    const openEdit = (dept) => {
        setSelectedDept(dept)
        setForm({ name: dept.name || '', code: dept.code || '', description: dept.description || '' })
        setShowEdit(true)
    }

    const openDelete = (dept) => {
        setSelectedDept(dept)
        setShowDeleteConfirm(true)
    }

    return (
        <Wrapper>
            <PageHeader>
                <div>
                    <h1>Departments</h1>
                    <p className="subtitle">{departments.length} department{departments.length !== 1 ? 's' : ''} total</p>
                </div>
                <HeaderActions>
                    <RefreshBtn onClick={refresh} disabled={fetchLoad} title="Refresh">
                        <FiRefreshCw size={15} />
                    </RefreshBtn>
                    <Button onClick={() => setShowCreate(true)}>+ Add Department</Button>
                </HeaderActions>
            </PageHeader>

            <ToolBar>
                <SearchInput
                    type="text"
                    placeholder="Search by name or code..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
                {search && (
                    <ClearBtn onClick={() => setSearch('')}>Clear</ClearBtn>
                )}
            </ToolBar>

            <TableWrap>
                {fetchLoad && <LoadingRow>Loading departments...</LoadingRow>}
                <Table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((dept) => (
                            <tr key={dept._id}>
                                <td><CodeBadge>{dept.code}</CodeBadge></td>
                                <td>{dept.name}</td>
                                <td>{dept.description || '—'}</td>
                                <td>
                                    <ActionRow>
                                        <SmallButton onClick={() => openEdit(dept)}>Edit</SmallButton>
                                        <SmallButton $variant="danger" onClick={() => openDelete(dept)}>Delete</SmallButton>
                                    </ActionRow>
                                </td>
                            </tr>
                        ))}
                        {!fetchLoad && paginated.length === 0 && (
                            <tr><td colSpan={4}><EmptyState>No departments found</EmptyState></td></tr>
                        )}
                    </tbody>
                </Table>
            </TableWrap>

            {totalPages > 1 && (
                <Pagination>
                    <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</PageBtn>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PageBtn key={p} $active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
                    ))}
                    <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</PageBtn>
                    <PageInfo>{filtered.length} results</PageInfo>
                </Pagination>
            )}

            {showCreate && (
                <ModalOverlay onClick={() => setShowCreate(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Create Department</h2>
                            <CloseBtn onClick={() => setShowCreate(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <form onSubmit={handleCreate}>
                            <FormGroup>
                                <label>Department Name</label>
                                <input type="text" placeholder="e.g. Computer Science" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Department Code</label>
                                <input type="text" placeholder="e.g. CSC" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Description</label>
                                <input type="text" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </FormGroup>
                            <ModalButton type="submit" disabled={createLoad}>{createLoad ? 'Creating...' : 'Create Department'}</ModalButton>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showEdit && selectedDept && (
                <ModalOverlay onClick={() => setShowEdit(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Edit Department</h2>
                            <CloseBtn onClick={() => setShowEdit(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <form onSubmit={handleEdit}>
                            <FormGroup>
                                <label>Department Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Department Code</label>
                                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Description</label>
                                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </FormGroup>
                            <ModalButton type="submit" disabled={updateLoad}>{updateLoad ? 'Saving...' : 'Save Changes'}</ModalButton>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showDeleteConfirm && selectedDept && (
                <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Delete Department</h2>
                            <CloseBtn onClick={() => setShowDeleteConfirm(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <p style={{ color: 'var(--light-text-color)', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong>{selectedDept.name}</strong>? This action cannot be undone.
                        </p>
                        <ActionRow>
                            <ModalButton $variant="danger" onClick={handleDelete} disabled={deleteLoad}>
                                {deleteLoad ? 'Deleting...' : 'Delete'}
                            </ModalButton>
                            <ModalButton $variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</ModalButton>
                        </ActionRow>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div``

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;

    h1 {
        font-size: 1.5rem;
        color: var(--text-color);
        margin: 0 0 0.25rem;
    }

    .subtitle {
        color: var(--light-text-color);
        font-size: 0.9rem;
        margin: 0;
    }
`

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`

const Button = styled.button`
    padding: 0.6rem 1.25rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: var(--primary-color);
    color: var(--white-color);
    font-weight: 600;
    font-size: 0.9rem;
`

const RefreshBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    background: var(--white-color);
    color: var(--light-text-color);
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`

const ToolBar = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    align-items: center;
`

const SearchInput = styled.input`
    height: 38px;
    padding: 0 1rem;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    min-width: 260px;

    &:focus {
        border-color: var(--primary-color);
    }
`

const ClearBtn = styled.button`
    height: 38px;
    padding: 0 1rem;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    background: transparent;
    font-size: 0.875rem;
    color: var(--light-text-color);
    cursor: pointer;
`

const TableWrap = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
`

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 0.85rem 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
        font-size: 0.9rem;
    }

    th {
        font-weight: 600;
        color: var(--light-text-color);
        background: #fafafa;
    }

    tr:last-child td {
        border-bottom: none;
    }
`

const CodeBadge = styled.span`
    display: inline-block;
    padding: 0.2rem 0.6rem;
    background: #f0f4ff;
    color: var(--primary-color);
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.5px;
`

const ActionRow = styled.div`
    display: flex;
    gap: 0.5rem;
`

const SmallButton = styled.button`
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    background: ${props => props.$variant === 'danger' ? '#dc2626' : 'var(--primary-color)'};
    color: white;
`

const LoadingRow = styled.div`
    padding: 1rem 1.25rem;
    color: var(--light-text-color);
    font-size: 0.9rem;
`

const EmptyState = styled.div`
    text-align: center;
    color: var(--light-text-color);
    padding: 2rem;
    font-size: 0.9rem;
`

const Pagination = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 1rem;
    flex-wrap: wrap;
`

const PageBtn = styled.button`
    min-width: 34px;
    height: 34px;
    padding: 0 0.5rem;
    border: 1px solid ${props => props.$active ? 'var(--primary-color)' : 'var(--stroke-color)'};
    border-radius: 6px;
    background: ${props => props.$active ? 'var(--primary-color)' : 'var(--white-color)'};
    color: ${props => props.$active ? 'white' : 'var(--text-color)'};
    font-size: 0.875rem;
    cursor: pointer;

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`

const PageInfo = styled.span`
    margin-left: 0.5rem;
    font-size: 0.8rem;
    color: var(--light-text-color);
`

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const ModalContent = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
`

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
        font-size: 1.25rem;
        margin: 0;
    }
`

const CloseBtn = styled.button`
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: var(--light-text-color);
`

const FormGroup = styled.div`
    margin-bottom: 1rem;

    label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--light-text-color);
        margin-bottom: 0.4rem;
    }

    input {
        width: 100%;
        height: 44px;
        padding: 0 1rem;
        border: 1px solid var(--stroke-color);
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;

        &:focus {
            border-color: var(--primary-color);
        }
    }
`

const ModalButton = styled.button`
    width: ${props => props.$variant === 'outline' ? 'auto' : '100%'};
    height: 44px;
    padding: 0 1.5rem;
    border: ${props => props.$variant === 'outline' ? '1px solid var(--stroke-color)' : 'none'};
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    background: ${props => props.$variant === 'danger' ? '#dc2626' : props.$variant === 'outline' ? 'transparent' : 'var(--primary-color)'};
    color: ${props => props.$variant === 'outline' ? 'var(--text-color)' : 'white'};

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`

export default DepartmentsPage
