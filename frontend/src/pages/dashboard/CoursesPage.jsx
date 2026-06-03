import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { FiRefreshCw } from 'react-icons/fi'
import { fetchCourses, createCourse, updateCourse, deleteCourse, assignLecturer } from '../../slices/courseSlice'
import { fetchDepartments } from '../../slices/departmentSlice'
import { fetchLecturers } from '../../slices/userSlice'

const PAGE_SIZE = 12

const CoursesPage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((store) => store.user)
    const { courses, fetchLoad, createLoad, updateLoad, deleteLoad, assignLoad } = useSelector((store) => store.course)
    const { departments } = useSelector((store) => store.department)
    const { lecturers, lecturersLoad: lecturersByDeptLoad } = useSelector((store) => store.user)
    const lecturersByDept = lecturers

    const role = user?.role
    const canEdit = role === 'admin'
    const isDeptAdmin = false
    const userDeptId = user?.department?._id || user?.department || ''
    const userDeptName = user?.department?.name || ''
    const userDeptCode = user?.department?.code || ''

    const [showCreate, setShowCreate] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [showAssign, setShowAssign] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [lecturerId, setLecturerId] = useState('')

    const [form, setForm] = useState({ courseCode: '', title: '', departmentCode: '', level: '' })

    const [search, setSearch] = useState('')
    const [levelFilter, setLevelFilter] = useState('')
    const [deptFilter, setDeptFilter] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        dispatch(fetchCourses())
        if (!isDeptAdmin) dispatch(fetchDepartments())
    }, [dispatch, isDeptAdmin])

    const refresh = () => {
        dispatch(fetchCourses())
        if (!isDeptAdmin) dispatch(fetchDepartments())
    }

    const filtered = useMemo(() => {
        let list = isDeptAdmin
            ? courses.filter((c) => c.department?.code === userDeptCode || (c.department?._id || c.department) === userDeptId)
            : courses

        if (search) {
            const q = search.toLowerCase()
            list = list.filter((c) =>
                c.courseCode?.toLowerCase().includes(q) ||
                c.title?.toLowerCase().includes(q)
            )
        }
        if (levelFilter) list = list.filter((c) => String(c.level) === levelFilter)
        if (deptFilter) list = list.filter((c) => (c.department?._id || c.department) === deptFilter)

        return list
    }, [courses, isDeptAdmin, userDeptCode, userDeptId, search, levelFilter, deptFilter])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const resetFilters = () => {
        setSearch('')
        setLevelFilter('')
        setDeptFilter('')
        setPage(1)
    }

    const handleCreate = (e) => {
        e.preventDefault()
        const payload = isDeptAdmin ? { ...form, departmentCode: userDeptCode } : form
        dispatch(createCourse(payload)).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Course created')
                setShowCreate(false)
                setForm({ courseCode: '', title: '', departmentCode: '', level: '' })
                dispatch(fetchCourses())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to create course')
            }
        })
    }

    const handleEdit = (e) => {
        e.preventDefault()
        dispatch(updateCourse({ courseId: selectedCourse._id, title: form.title, level: form.level })).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Course updated')
                setShowEdit(false)
                dispatch(fetchCourses())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to update course')
            }
        })
    }

    const handleDelete = () => {
        dispatch(deleteCourse({ courseId: selectedCourse._id })).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success('Course deleted')
                setShowDeleteConfirm(false)
                dispatch(fetchCourses())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to delete course')
            }
        })
    }

    const handleAssign = () => {
        dispatch(assignLecturer({ courseId: selectedCourse._id, lecturerId })).then((result) => {
            if (result.payload?.status === 'success') {
                toast.success(result.payload.response?.message || 'Lecturer assigned')
                setShowAssign(false)
                setLecturerId('')
                dispatch(fetchCourses())
            } else {
                toast.error(result.payload?.response?.message || result.payload?.response?.msg || 'Failed to assign lecturer')
            }
        })
    }

    const openEdit = (course) => {
        setSelectedCourse(course)
        setForm({
            courseCode: course.courseCode || '',
            title: course.title || '',
            departmentCode: course.department?.code || '',
            level: course.level || '',
        })
        setShowEdit(true)
    }

    const openAssign = (course) => {
        setSelectedCourse(course)
        setLecturerId('')
        setShowAssign(true)
        const deptId = course.department?._id || course.department
        if (deptId) dispatch(fetchLecturers({ departmentId: deptId }))
    }

    const openDelete = (course) => {
        setSelectedCourse(course)
        setShowDeleteConfirm(true)
    }

    return (
        <Wrapper>
            <PageHeader>
                <h1>Courses</h1>
                <HeaderActions>
                    <RefreshBtn onClick={refresh} disabled={fetchLoad} title="Refresh">
                        <FiRefreshCw size={15} />
                    </RefreshBtn>
                    {canEdit && (
                        <Button onClick={() => setShowCreate(true)}>+ Add Course</Button>
                    )}
                </HeaderActions>
            </PageHeader>

            <ToolBar>
                <SearchInput
                    type="text"
                    placeholder="Search by code or title..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
                <FilterSelect value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1) }}>
                    <option value="">All Levels</option>
                    {[100, 200, 300, 400, 500, 600].map((l) => (
                        <option key={l} value={String(l)}>{l}L</option>
                    ))}
                </FilterSelect>
                {!isDeptAdmin && (
                    <FilterSelect value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}>
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                    </FilterSelect>
                )}
                {(search || levelFilter || deptFilter) && (
                    <ClearBtn onClick={resetFilters}>Clear</ClearBtn>
                )}
            </ToolBar>

            <TableWrap>
                {fetchLoad && <LoadingRow>Loading courses...</LoadingRow>}
                <Table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Level</th>
                            <th>Lecturer</th>
                            {canEdit && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((course) => (
                            <tr key={course._id}>
                                <td>{course.courseCode}</td>
                                <td>{course.title}</td>
                                <td>{course.department?.name || '—'}</td>
                                <td>{course.level ? `${course.level}L` : '—'}</td>
                                <td>{course.lecturer ? `${course.lecturer.firstName} ${course.lecturer.lastName}` : '—'}</td>
                                {canEdit && (
                                    <td>
                                        <ActionRow>
                                            <SmallButton onClick={() => openEdit(course)}>Edit</SmallButton>
                                            <SmallButton $variant="secondary" onClick={() => openAssign(course)}>Assign</SmallButton>
                                            <SmallButton $variant="danger" onClick={() => openDelete(course)}>Delete</SmallButton>
                                        </ActionRow>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {!fetchLoad && paginated.length === 0 && (
                            <tr><td colSpan={canEdit ? 6 : 5}><EmptyState>No courses found</EmptyState></td></tr>
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
                            <h2>Create Course</h2>
                            <CloseBtn onClick={() => setShowCreate(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <form onSubmit={handleCreate}>
                            <FormGroup>
                                <label>Course Code</label>
                                <input type="text" placeholder="e.g. CSC301" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Course Title</label>
                                <input type="text" placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Department</label>
                                {isDeptAdmin ? (
                                    <ReadonlyField>{userDeptName || 'Your department'}</ReadonlyField>
                                ) : (
                                    <select value={form.departmentCode} onChange={(e) => setForm({ ...form, departmentCode: e.target.value })} required>
                                        <option value="">Select department</option>
                                        {departments.map((d) => (
                                            <option key={d._id} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <label>Level</label>
                                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                                    <option value="">Select level</option>
                                    {[100, 200, 300, 400, 500, 600].map((l) => (
                                        <option key={l} value={l}>{l}L</option>
                                    ))}
                                </select>
                            </FormGroup>
                            <ModalButton type="submit" disabled={createLoad}>{createLoad ? 'Creating...' : 'Create Course'}</ModalButton>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showEdit && selectedCourse && (
                <ModalOverlay onClick={() => setShowEdit(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Edit Course</h2>
                            <CloseBtn onClick={() => setShowEdit(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <form onSubmit={handleEdit}>
                            <FormGroup>
                                <label>Course Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </FormGroup>
                            <FormGroup>
                                <label>Level</label>
                                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                                    <option value="">Select level</option>
                                    {[100, 200, 300, 400, 500, 600].map((l) => (
                                        <option key={l} value={l}>{l}L</option>
                                    ))}
                                </select>
                            </FormGroup>
                            <ModalButton type="submit" disabled={updateLoad}>{updateLoad ? 'Saving...' : 'Save Changes'}</ModalButton>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showAssign && selectedCourse && (
                <ModalOverlay onClick={() => setShowAssign(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Assign Lecturer</h2>
                            <CloseBtn onClick={() => setShowAssign(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <AssignMeta>
                            <span className="label">Course</span>
                            <span className="value">{selectedCourse.courseCode} — {selectedCourse.title}</span>
                        </AssignMeta>
                        <AssignMeta>
                            <span className="label">Department</span>
                            <span className="value">{selectedCourse.department?.name || '—'}</span>
                        </AssignMeta>

                        {lecturersByDeptLoad ? (
                            <AssignLoading>Loading lecturers...</AssignLoading>
                        ) : lecturersByDept.length === 0 ? (
                            <AssignEmpty>No approved lecturers found in this department.</AssignEmpty>
                        ) : (
                            <>
                                <AssignLabel>Select a lecturer:</AssignLabel>
                                <LecturerList>
                                    {lecturersByDept.map((l) => (
                                        <LecturerRow
                                            key={l._id}
                                            $selected={lecturerId === l._id}
                                            onClick={() => setLecturerId(l._id)}
                                        >
                                            <LecturerAvatar>
                                                {l.firstName[0]}{l.lastName[0]}
                                            </LecturerAvatar>
                                            <div>
                                                <div className="name">{l.firstName} {l.lastName}</div>
                                                <div className="meta">{l.staffId} · {l.email}</div>
                                            </div>
                                            {lecturerId === l._id && <SelectedMark>✓</SelectedMark>}
                                        </LecturerRow>
                                    ))}
                                </LecturerList>
                                <ModalButton
                                    onClick={handleAssign}
                                    disabled={!lecturerId || assignLoad}
                                    style={{ marginTop: '1rem' }}
                                >
                                    {assignLoad ? 'Assigning...' : 'Assign Lecturer'}
                                </ModalButton>
                            </>
                        )}
                    </ModalContent>
                </ModalOverlay>
            )}

            {showDeleteConfirm && selectedCourse && (
                <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h2>Delete Course</h2>
                            <CloseBtn onClick={() => setShowDeleteConfirm(false)}>✕</CloseBtn>
                        </ModalHeader>
                        <p style={{ color: 'var(--light-text-color)', marginBottom: '1.5rem' }}>
                            Are you sure you want to delete <strong style={{ color: 'var(--text-color)' }}>{selectedCourse.title}</strong>? This action cannot be undone.
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
    align-items: center;
    margin-bottom: 1.25rem;

    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0; }
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
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    transition: opacity 0.2s;
    &:hover { opacity: 0.9; }
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
    transition: background 0.2s;

    &:hover { background: rgba(99, 102, 241, 0.1); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const ToolBar = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
`

const SearchInput = styled.input`
    height: 38px;
    padding: 0 1rem;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    min-width: 220px;
    flex: 1;
    transition: border-color 0.2s;

    &:focus { border-color: var(--primary-color); }
`

const FilterSelect = styled.select`
    height: 38px;
    padding: 0 2.25rem 0 0.75rem;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;

    &:focus { border-color: var(--primary-color); }
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
    transition: background 0.2s;
    &:hover { background: rgba(99, 102, 241, 0.08); }
`

const TableWrap = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
    overflow-x: auto;
`

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        padding: 0.85rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--stroke-color);
        font-size: 0.9rem;
        color: var(--text-color);
    }

    th {
        font-weight: 600;
        color: var(--light-text-color);
        background: var(--secondary-color);
    }

    tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: rgba(99, 102, 241, 0.05); }

    select {
        padding: 0.35rem 2.25rem 0.35rem 0.6rem;
        border: 1px solid var(--stroke-color);
        border-radius: 6px;
        font-size: 0.85rem;
        outline: none;
    }
`

const ActionRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`

const SmallButton = styled.button`
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: opacity 0.2s;
    background: ${props =>
        props.$variant === 'danger' ? '#ef4444'
        : props.$variant === 'secondary' ? 'var(--highlight-color)'
        : 'var(--primary-color)'};
    color: white;
    &:hover { opacity: 0.85; }
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
    transition: all 0.2s;

    &:hover:not(:disabled) { border-color: var(--primary-color); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const PageInfo = styled.span`
    margin-left: 0.5rem;
    font-size: 0.8rem;
    color: var(--light-text-color);
`

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
`

const ModalContent = styled.div`
    background: var(--white-color);
    border: 1px solid var(--stroke-color);
    border-radius: 14px;
    padding: 2rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 { font-size: 1.25rem; margin: 0; color: var(--text-color); }
`

const CloseBtn = styled.button`
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: var(--light-text-color);
    transition: color 0.2s;
    &:hover { color: var(--text-color); }
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
        transition: border-color 0.2s;

        &:focus { border-color: var(--primary-color); }
    }

    select {
        width: 100%;
        height: 44px;
        padding: 0 2.5rem 0 1rem;
        border: 1px solid var(--stroke-color);
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s;

        &:focus { border-color: var(--primary-color); }
    }
`

const ReadonlyField = styled.div`
    height: 44px;
    padding: 0 1rem;
    border: 1px solid var(--stroke-color);
    border-radius: 8px;
    font-size: 0.9rem;
    background: var(--secondary-color);
    color: var(--light-text-color);
    display: flex;
    align-items: center;
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
    transition: opacity 0.2s;
    background: ${props =>
        props.$variant === 'danger' ? '#ef4444'
        : props.$variant === 'outline' ? 'transparent'
        : 'var(--primary-color)'};
    color: ${props => props.$variant === 'outline' ? 'var(--text-color)' : 'white'};
    margin-top: ${props => props.$variant ? '0' : '0.5rem'};

    &:hover:not(:disabled) { opacity: 0.88; }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
`

const AssignMeta = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;

    .label { color: var(--light-text-color); min-width: 80px; font-weight: 500; }
    .value { color: var(--text-color); font-weight: 600; }
`

const AssignLabel = styled.p`
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--light-text-color);
    margin: 1rem 0 0.5rem;
`

const AssignLoading = styled.p`
    color: var(--light-text-color);
    font-size: 0.9rem;
    padding: 1rem 0;
`

const AssignEmpty = styled.p`
    color: var(--light-text-color);
    font-size: 0.875rem;
    padding: 1rem 0;
    text-align: center;
`

const LecturerList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 280px;
    overflow-y: auto;
`

const LecturerRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.75rem;
    border: 1.5px solid ${props => props.$selected ? 'var(--primary-color)' : 'var(--stroke-color)'};
    border-radius: 8px;
    cursor: pointer;
    background: ${props => props.$selected ? 'rgba(99, 102, 241, 0.12)' : 'transparent'};
    transition: border-color 0.15s, background 0.15s;

    &:hover {
        border-color: var(--primary-color);
        background: rgba(99, 102, 241, 0.1);
    }

    .name { font-size: 0.9rem; font-weight: 600; color: var(--text-color); }
    .meta { font-size: 0.78rem; color: var(--light-text-color); margin-top: 0.1rem; }
`

const LecturerAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
    text-transform: uppercase;
`

const SelectedMark = styled.span`
    margin-left: auto;
    color: var(--primary-color);
    font-weight: 700;
    font-size: 1rem;
`

export default CoursesPage
