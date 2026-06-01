import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllResults, deleteResult, editResult, clearResultNotifications } from '../../slices/resultSlice'

const gradeColor = (grade) => {
    const map = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#9333ea', E: '#f97316', F: '#dc2626' }
    return map[grade] || '#6b7280'
}

const BLANK_EDIT = { score: '', semester: 'First', academicYear: '', remarks: '' }

const ResultsManagePage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((s) => s.user)
    const { allResults, allResultsLoad, allResultsError, edit } = useSelector((s) => s.result)

    const [search, setSearch] = useState('')
    const [semester, setSemester] = useState('')
    const [academicYear, setAcademicYear] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [editTarget, setEditTarget] = useState(null)
    const [editForm, setEditForm] = useState(BLANK_EDIT)

    const role = user?.role

    useEffect(() => {
        if (role === 'admin' || role === 'lecturer') {
            dispatch(fetchAllResults({
                search: search || undefined,
                semester: semester || undefined,
                academicYear: academicYear || undefined,
            }))
        }
    }, [dispatch, search, semester, academicYear, role])

    if (role !== 'admin' && role !== 'lecturer') {
        return (
            <Wrapper>
                <h1>Manage Results</h1>
                <EmptyState>You do not have permission to view this page.</EmptyState>
            </Wrapper>
        )
    }

    const canEditResult = (r) => {
        if (role === 'admin') return true
        const isUploader = r.uploadedBy?._id === user?.id || r.uploadedBy?._id === user?._id
        const isCourseLecturer = r.course?.lecturer === user?.id || r.course?.lecturer === user?._id ||
            r.course?.lecturer?._id === user?.id || r.course?.lecturer?._id === user?._id
        return isUploader || isCourseLecturer
    }

    const openEdit = (r) => {
        dispatch(clearResultNotifications())
        setEditTarget(r)
        setEditForm({
            score: r.score,
            semester: r.semester,
            academicYear: r.academicYear,
            remarks: r.remarks || '',
        })
    }

    const closeEdit = () => {
        setEditTarget(null)
        setEditForm(BLANK_EDIT)
        dispatch(clearResultNotifications())
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        dispatch(editResult({ id: editTarget._id, ...editForm })).then((res) => {
            if (res.payload?.status === 'success') closeEdit()
        })
    }

    const handleDelete = (id) => {
        dispatch(deleteResult({ id }))
        setConfirmDelete(null)
    }

    return (
        <Wrapper>
            <PageHeader>
                <h1>Manage Results</h1>
                <Filters>
                    <input
                        type="text"
                        placeholder="Search by student name, matric, or course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="">All Semesters</option>
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Academic Year (e.g. 2023/2024)"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        style={{ width: '200px' }}
                    />
                </Filters>
            </PageHeader>

            <Summary>{allResults.length} result{allResults.length !== 1 ? 's' : ''} found</Summary>

            {allResultsLoad && <StatusMsg>Loading results...</StatusMsg>}
            {allResultsError && <ErrorMsg>Failed to load results.</ErrorMsg>}

            {!allResultsLoad && allResults.length === 0 && (
                <EmptyState>No results match your search criteria.</EmptyState>
            )}

            {allResults.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Matric No.</th>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Year</th>
                            <th>Score</th>
                            <th>Grade</th>
                            <th>Uploaded By</th>
                            <th>Document</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allResults.map((r) => (
                            <tr key={r._id}>
                                <td>{r.student?.firstName} {r.student?.lastName}</td>
                                <td><code>{r.student?.matricNumber || '—'}</code></td>
                                <td><strong>{r.course?.courseCode}</strong> — {r.course?.title}</td>
                                <td>{r.semester}</td>
                                <td>{r.academicYear}</td>
                                <td>{r.score}</td>
                                <td><GradeBadge $color={gradeColor(r.grade)}>{r.grade}</GradeBadge></td>
                                <td>{r.uploadedBy?.firstName} {r.uploadedBy?.lastName}</td>
                                <td>
                                    {r.documentUrl
                                        ? <a href={r.documentUrl} target="_blank" rel="noreferrer">View</a>
                                        : '—'}
                                </td>
                                <td>
                                    <ActionGroup>
                                        {canEditResult(r) && (
                                            <EditBtn onClick={() => openEdit(r)}>Edit</EditBtn>
                                        )}
                                        {role === 'admin' && (
                                            <DeleteBtn onClick={() => setConfirmDelete(r._id)}>Delete</DeleteBtn>
                                        )}
                                    </ActionGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Edit Modal */}
            {editTarget && (
                <Overlay onClick={closeEdit}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <div>
                                <h2>Edit Result</h2>
                                <ModalSub>
                                    {editTarget.student?.firstName} {editTarget.student?.lastName} &mdash; {editTarget.course?.courseCode}
                                </ModalSub>
                            </div>
                            <CloseBtn onClick={closeEdit}>✕</CloseBtn>
                        </ModalHeader>

                        {edit.error && <ErrorMsg>{edit.errorMsg}</ErrorMsg>}

                        <form onSubmit={handleEditSubmit}>
                            <ModalRow>
                                <ModalField>
                                    <label>Score (0–100) *</label>
                                    <input
                                        type="number" min="0" max="100"
                                        value={editForm.score}
                                        onChange={(e) => setEditForm((f) => ({ ...f, score: e.target.value }))}
                                        required
                                    />
                                </ModalField>
                                <ModalField>
                                    <label>Semester *</label>
                                    <select
                                        value={editForm.semester}
                                        onChange={(e) => setEditForm((f) => ({ ...f, semester: e.target.value }))}
                                    >
                                        <option value="First">First</option>
                                        <option value="Second">Second</option>
                                    </select>
                                </ModalField>
                            </ModalRow>
                            <ModalField>
                                <label>Academic Year *</label>
                                <input
                                    type="text" placeholder="e.g. 2023/2024"
                                    value={editForm.academicYear}
                                    onChange={(e) => setEditForm((f) => ({ ...f, academicYear: e.target.value }))}
                                    required
                                />
                            </ModalField>
                            <ModalField>
                                <label>Remarks</label>
                                <textarea
                                    rows={3} placeholder="Optional remarks"
                                    value={editForm.remarks}
                                    onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
                                />
                            </ModalField>
                            <ModalActions>
                                <CancelBtn type="button" onClick={closeEdit}>Cancel</CancelBtn>
                                <SaveBtn type="submit" disabled={edit.load}>
                                    {edit.load ? 'Saving...' : 'Save Changes'}
                                </SaveBtn>
                            </ModalActions>
                        </form>
                    </Modal>
                </Overlay>
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <Overlay onClick={() => setConfirmDelete(null)}>
                    <ConfirmBox onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Result?</h3>
                        <p>This action cannot be undone.</p>
                        <div>
                            <button onClick={() => handleDelete(confirmDelete)} className="danger">Delete</button>
                            <button onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </div>
                    </ConfirmBox>
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
    display: flex; gap: 0.75rem; flex-wrap: wrap;
    input, select {
        height: 40px; padding: 0 0.75rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.9em; outline: none; background-color: white;
        &:focus { border-color: var(--primary-color); }
    }
    select { padding-right: 2rem; }
    input { min-width: 200px; }
`
const Summary = styled.p`font-size: 0.85rem; color: var(--light-text-color); margin-bottom: 1rem;`
const Table = styled.table`
    width: 100%; border-collapse: collapse; background: white;
    border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    th, td { padding: 0.75rem 0.875rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #f3f4f6; }
    th { background: #f9fafb; color: var(--light-text-color); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #f9fafb; }
    code { font-family: monospace; background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }
    a { color: var(--primary-color); font-size: 0.8rem; }
`
const GradeBadge = styled.span`
    display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px;
    font-weight: 700; font-size: 0.85rem;
    color: ${(p) => p.$color}; background: ${(p) => p.$color}18;
`
const ActionGroup = styled.div`display: flex; gap: 0.4rem;`
const EditBtn = styled.button`
    padding: 0.3rem 0.65rem; background: var(--primary-color); color: white;
    border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    &:hover { opacity: 0.85; }
`
const DeleteBtn = styled.button`
    padding: 0.3rem 0.65rem; background: #fff0f0; color: #dc2626;
    border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    &:hover { background: #fecaca; }
`
const StatusMsg = styled.p`color: var(--light-text-color); padding: 2rem 0; text-align: center;`
const ErrorMsg = styled.p`
    color: #dc2626; background: #fff0f0; border-left: 3px solid #dc2626;
    padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9em;
`
const EmptyState = styled.div`
    text-align: center; padding: 4rem 2rem; color: var(--light-text-color);
    background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`
const Overlay = styled.div`
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
`
const Modal = styled.div`
    background: white; border-radius: 14px; padding: 1.75rem;
    width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    max-height: 90vh; overflow-y: auto;

    input, select, textarea {
        width: 100%; padding: 0.55rem 0.85rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.9em; outline: none; background-color: white;
        box-sizing: border-box;
        &:focus { border-color: var(--primary-color); }
    }
    select { padding-right: 2rem; }
    textarea { resize: vertical; }
`
const ModalHeader = styled.div`
    display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;
    h2 { font-size: 1.1rem; font-weight: 700; color: var(--text-color); margin: 0 0 0.2rem; }
`
const ModalSub = styled.p`font-size: 0.8rem; color: var(--light-text-color); margin: 0;`
const CloseBtn = styled.button`
    background: none; border: none; font-size: 1rem; cursor: pointer;
    color: var(--light-text-color); padding: 0.2rem 0.4rem; flex-shrink: 0;
    &:hover { color: var(--text-color); }
`
const ModalRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;`
const ModalField = styled.div`
    display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem;
    label { font-size: 0.8rem; font-weight: 600; color: var(--light-text-color); }
`
const ModalActions = styled.div`display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;`
const CancelBtn = styled.button`
    padding: 0.55rem 1.25rem; border: 1px solid var(--stroke-color);
    background: white; border-radius: 8px; cursor: pointer; font-size: 0.9em;
    &:hover { background: #f9fafb; }
`
const SaveBtn = styled.button`
    padding: 0.55rem 1.5rem; background: var(--primary-color); color: white;
    border: none; border-radius: 8px; font-size: 0.9em; font-weight: 600; cursor: pointer;
    &:disabled { opacity: 0.7; cursor: not-allowed; }
`
const ConfirmBox = styled.div`
    background: white; border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    h3 { margin: 0 0 0.5rem; color: var(--text-color); }
    p { color: var(--light-text-color); margin-bottom: 1.5rem; font-size: 0.95rem; }
    div { display: flex; gap: 0.75rem; }
    button {
        flex: 1; padding: 0.6rem; border: none; border-radius: 8px;
        font-size: 0.95em; font-weight: 600; cursor: pointer;
        &.danger { background: #dc2626; color: white; &:hover { background: #b91c1c; } }
        &:not(.danger) { background: #f3f4f6; color: var(--text-color); &:hover { background: #e5e7eb; } }
    }
`

export default ResultsManagePage
