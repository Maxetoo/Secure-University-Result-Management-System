import { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { uploadResult, editResult, fetchStudentResults, clearResultNotifications } from '../../slices/resultSlice'
import { fetchStudents } from '../../slices/userSlice'
import { fetchCourses } from '../../slices/courseSlice'

const UploadResultsPage = () => {
    const dispatch = useDispatch()
    const { upload, edit, studentResults, studentResultsLoad } = useSelector((s) => s.result)
    const { students } = useSelector((s) => s.user)
    const { courses } = useSelector((s) => s.course)

    const [mode, setMode] = useState('upload') // 'upload' | 'edit'
    const [editingId, setEditingId] = useState(null)
    const [selectedStudent, setSelectedStudent] = useState('')
    const fileRef = useRef(null)

    const [form, setForm] = useState({
        studentId: '',
        courseId: '',
        semester: 'First',
        academicYear: '',
        score: '',
        remarks: '',
    })

    useEffect(() => {
        dispatch(fetchStudents())
        dispatch(fetchCourses())
        return () => dispatch(clearResultNotifications())
    }, [dispatch])

    useEffect(() => {
        if (selectedStudent) dispatch(fetchStudentResults({ studentId: selectedStudent }))
    }, [selectedStudent, dispatch])

    const takenCourseIds = new Set(studentResults.map((r) => r.course?._id).filter(Boolean))
    const availableCourses = form.studentId
        ? courses.filter((c) => !takenCourseIds.has(c._id))
        : courses

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'studentId') {
            setForm((f) => ({ ...f, studentId: value, courseId: '' }))
            setSelectedStudent(value)
        } else {
            setForm((f) => ({ ...f, [name]: value }))
        }
    }

    const handleUpload = (e) => {
        e.preventDefault()
        const payload = { ...form }
        if (fileRef.current?.files[0]) payload.document = fileRef.current.files[0]
        dispatch(uploadResult(payload)).then(() => {
            setForm({ studentId: '', courseId: '', semester: 'First', academicYear: '', score: '', remarks: '' })
            setSelectedStudent('')
            if (fileRef.current) fileRef.current.value = ''
        })
    }

    const handleEdit = (e) => {
        e.preventDefault()
        const payload = { id: editingId, score: form.score, remarks: form.remarks, semester: form.semester, academicYear: form.academicYear }
        if (fileRef.current?.files[0]) payload.document = fileRef.current.files[0]
        dispatch(editResult(payload))
    }

    const startEdit = (result) => {
        setMode('edit')
        setEditingId(result._id)
        setForm({
            studentId: result.student?._id || '',
            courseId: result.course?._id || '',
            semester: result.semester,
            academicYear: result.academicYear,
            score: result.score,
            remarks: result.remarks || '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setMode('upload')
        setEditingId(null)
        setForm({ studentId: '', courseId: '', semester: 'First', academicYear: '', score: '', remarks: '' })
        dispatch(clearResultNotifications())
    }

    const activeState = mode === 'edit' ? edit : upload

    return (
        <Wrapper>
            <PageHeader>
                <h1>{mode === 'edit' ? 'Edit Result' : 'Upload Result'}</h1>
                {mode === 'edit' && <CancelBtn onClick={cancelEdit}>Cancel Edit</CancelBtn>}
            </PageHeader>

            {activeState.error && <ErrorBanner>{activeState.errorMsg}</ErrorBanner>}
            {activeState.successMsg && <SuccessBanner>{activeState.successMsg}</SuccessBanner>}

            <Card>
                <form onSubmit={mode === 'edit' ? handleEdit : handleUpload}>
                    {mode === 'upload' && (
                        <Row>
                            <label>
                                <span>Student *</span>
                                <select name="studentId" value={form.studentId} onChange={handleChange} required>
                                    <option value="">Select student</option>
                                    {students.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.firstName} {s.lastName} — {s.matricNumber}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Course *</span>
                                <select name="courseId" value={form.courseId} onChange={handleChange} required>
                                    <option value="">
                                        {form.studentId && availableCourses.length === 0
                                            ? 'All courses already graded'
                                            : 'Select course'}
                                    </option>
                                    {availableCourses.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.courseCode} — {c.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </Row>
                    )}

                    {mode === 'edit' && (
                        <InfoLine>Editing result for student ID: <strong>{form.studentId}</strong></InfoLine>
                    )}

                    <Row>
                        <label>
                            <span>Semester *</span>
                            <select name="semester" value={form.semester} onChange={handleChange} required>
                                <option value="First">First</option>
                                <option value="Second">Second</option>
                            </select>
                        </label>
                        <label>
                            <span>Academic Year *</span>
                            <input type="text" name="academicYear" placeholder="e.g. 2023/2024" value={form.academicYear} onChange={handleChange} required />
                        </label>
                    </Row>

                    <Row>
                        <label>
                            <span>Score (0–100) *</span>
                            <input type="number" name="score" placeholder="Score" min="0" max="100" value={form.score} onChange={handleChange} required />
                        </label>
                        <label>
                            <span>Result Document (PDF/Image)</span>
                            <input type="file" accept=".pdf,image/*" ref={fileRef} />
                        </label>
                    </Row>

                    <label>
                        <span>Remarks</span>
                        <textarea name="remarks" placeholder="Optional remarks" rows={3} value={form.remarks} onChange={handleChange} />
                    </label>

                    <SubmitBtn type="submit" disabled={activeState.load}>
                        {activeState.load ? 'Saving...' : mode === 'edit' ? 'Update Result' : 'Upload Result'}
                    </SubmitBtn>
                </form>
            </Card>

            <SectionTitle>
                View Student Results
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                    <option value="">Select a student</option>
                    {students.map((s) => (
                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} — {s.matricNumber}</option>
                    ))}
                </select>
            </SectionTitle>

            {studentResultsLoad && <p style={{ color: 'var(--light-text-color)' }}>Loading...</p>}

            {selectedStudent && !studentResultsLoad && studentResults.length === 0 && (
                <p style={{ color: 'var(--light-text-color)' }}>No results found for this student.</p>
            )}

            {studentResults.length > 0 && (
                <Table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Year</th>
                            <th>Score</th>
                            <th>Grade</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentResults.map((r) => (
                            <tr key={r._id}>
                                <td>{r.course?.courseCode} — {r.course?.title}</td>
                                <td>{r.semester}</td>
                                <td>{r.academicYear}</td>
                                <td>{r.score}</td>
                                <td><strong>{r.grade}</strong></td>
                                <td>
                                    <EditBtn onClick={() => startEdit(r)}>Edit</EditBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div``
const PageHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0; }
`
const Card = styled.div`
    background: white; border-radius: 12px; padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem;

    label { display: flex; flex-direction: column; gap: 0.4rem; span { font-size: 0.85rem; color: var(--light-text-color); font-weight: 600; } }

    input, select, textarea {
        width: 100%; padding: 0.6rem 0.9rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.95em; outline: none; box-sizing: border-box;
        &:focus { border-color: var(--primary-color); }
    }
    select { padding-right: 2rem; }
    textarea { resize: vertical; }
    input[type="file"] { padding: 0.4rem 0.5rem; }
`
const Row = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;
`
const InfoLine = styled.p`
    font-size: 0.9rem; color: var(--light-text-color); margin-bottom: 1rem;
`
const SubmitBtn = styled.button`
    margin-top: 1rem; padding: 0.7rem 2rem; background: var(--primary-color); color: white;
    border: none; border-radius: 8px; font-size: 1em; font-weight: 600; cursor: pointer;
    &:disabled { opacity: 0.7; cursor: not-allowed; }
`
const CancelBtn = styled.button`
    padding: 0.5rem 1.25rem; border: 1px solid #dc2626; color: #dc2626;
    background: transparent; border-radius: 8px; cursor: pointer; font-size: 0.9em;
    &:hover { background: #fff0f0; }
`
const SectionTitle = styled.div`
    display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;
    font-size: 1.1rem; font-weight: 600; color: var(--text-color);
    select {
        padding: 0.4rem 2rem 0.4rem 0.75rem; border: 1px solid var(--stroke-color);
        border-radius: 8px; font-size: 0.9em; outline: none;
        &:focus { border-color: var(--primary-color); }
    }
`
const Table = styled.table`
    width: 100%; border-collapse: collapse; background: white;
    border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    th, td { padding: 0.875rem 1rem; text-align: left; font-size: 0.9rem; border-bottom: 1px solid #f3f4f6; }
    th { background: #f9fafb; color: var(--light-text-color); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #f9fafb; }
`
const EditBtn = styled.button`
    padding: 0.3rem 0.75rem; background: var(--primary-color); color: white;
    border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer;
    &:hover { opacity: 0.85; }
`
const ErrorBanner = styled.p`
    margin-bottom: 1rem; padding: 0.75rem 1rem; background: #fff0f0;
    border-left: 3px solid #dc2626; border-radius: 8px; color: #dc2626; font-size: 0.9em;
`
const SuccessBanner = styled.p`
    margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f0fff4;
    border-left: 3px solid #16a34a; border-radius: 8px; color: #16a34a; font-size: 0.9em;
`

export default UploadResultsPage
