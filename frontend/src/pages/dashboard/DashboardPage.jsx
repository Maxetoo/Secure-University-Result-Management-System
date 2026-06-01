import { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses } from '../../slices/courseSlice'
import { fetchDepartments } from '../../slices/departmentSlice'
import { fetchMyResults, fetchAllResults } from '../../slices/resultSlice'
import { fetchAllUsers } from '../../slices/userSlice'

const DashboardPage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((store) => store.user)
    const { courses } = useSelector((store) => store.course)
    const { departments } = useSelector((store) => store.department)
    const { myResults, allResults } = useSelector((store) => store.result)
    const { allUsers } = useSelector((store) => store.user)

    const role = user?.role

    useEffect(() => {
        if (role === 'admin') {
            dispatch(fetchDepartments())
            dispatch(fetchCourses())
            dispatch(fetchAllResults())
            dispatch(fetchAllUsers())
        }
        if (role === 'lecturer') {
            dispatch(fetchCourses())
        }
        if (role === 'student') {
            dispatch(fetchMyResults())
        }
    }, [role, dispatch])

    const firstName = user?.firstName || 'User'

    const studentCount = allUsers.filter((u) => u.role === 'student').length
    const lecturerCount = allUsers.filter((u) => u.role === 'lecturer').length

    return (
        <Wrapper>
            <PageHeader>
                <div>
                    <h1>Welcome back, {firstName}</h1>
                    <p className="subtitle">University Result Management System</p>
                </div>
                <RoleBadge $role={role}>{role?.charAt(0).toUpperCase() + role?.slice(1)}</RoleBadge>
            </PageHeader>

            {role === 'admin' && (
                <Grid>
                    <StatCard>
                        <CardLabel>Total Departments</CardLabel>
                        <CardValue>{departments.length}</CardValue>
                    </StatCard>
                    <StatCard>
                        <CardLabel>Total Courses</CardLabel>
                        <CardValue>{courses.length}</CardValue>
                    </StatCard>
                    <StatCard>
                        <CardLabel>Total Students</CardLabel>
                        <CardValue>{studentCount}</CardValue>
                    </StatCard>
                    <StatCard>
                        <CardLabel>Total Lecturers</CardLabel>
                        <CardValue>{lecturerCount}</CardValue>
                    </StatCard>
                    <StatCard>
                        <CardLabel>Total Results Records</CardLabel>
                        <CardValue>{allResults.length}</CardValue>
                    </StatCard>
                </Grid>
            )}

            {role === 'lecturer' && (
                <Grid>
                    <StatCard>
                        <CardLabel>Total Courses</CardLabel>
                        <CardValue>{courses.length}</CardValue>
                    </StatCard>
                </Grid>
            )}

            {role === 'student' && (
                <>
                    <Grid>
                        <StatCard>
                            <CardLabel>Results on Record</CardLabel>
                            <CardValue>{myResults.length}</CardValue>
                        </StatCard>
                        {user?.department && (
                            <StatCard>
                                <CardLabel>Department</CardLabel>
                                <CardValue style={{ fontSize: '1.2rem' }}>
                                    {user.department?.name || user.department}
                                </CardValue>
                            </StatCard>
                        )}
                        {user?.level && (
                            <StatCard>
                                <CardLabel>Level</CardLabel>
                                <CardValue>{user.level}</CardValue>
                            </StatCard>
                        )}
                    </Grid>
                    {myResults.length > 0 && (
                        <RecentResults>
                            <h3>Recent Results</h3>
                            <table>
                                <thead>
                                    <tr><th>Course</th><th>Semester</th><th>Year</th><th>Score</th><th>Grade</th></tr>
                                </thead>
                                <tbody>
                                    {myResults.slice(0, 5).map((r) => (
                                        <tr key={r._id}>
                                            <td>{r.course?.courseCode} — {r.course?.title}</td>
                                            <td>{r.semester}</td>
                                            <td>{r.academicYear}</td>
                                            <td>{r.score}</td>
                                            <td><strong>{r.grade}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </RecentResults>
                    )}
                </>
            )}

            <UserInfo>
                <p>Email: <strong>{user?.email}</strong></p>
                {user?.matricNumber && <p>Matric: <strong>{user.matricNumber}</strong></p>}
                {user?.staffId && <p>Staff ID: <strong>{user.staffId}</strong></p>}
            </UserInfo>
        </Wrapper>
    )
}

const Wrapper = styled.div`padding: 0;`

const PageHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0; }
    .subtitle { margin-top: 0.25rem; color: var(--light-text-color); font-size: 0.95rem; }
`

const RoleBadge = styled.span`
    padding: 0.35rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
    background: ${(p) => p.$role === 'admin' ? '#fef3c7' : p.$role === 'lecturer' ? '#dbeafe' : '#dcfce7'};
    color: ${(p) => p.$role === 'admin' ? '#92400e' : p.$role === 'lecturer' ? '#1e40af' : '#166534'};
`

const Grid = styled.div`
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;
`

const StatCard = styled.div`
    background: var(--white-color); border-radius: 12px; padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`

const CardLabel = styled.p`
    font-size: 0.85rem; color: var(--light-text-color); margin-bottom: 0.75rem; font-weight: 500;
`

const CardValue = styled.h2`
    font-size: 2rem; font-weight: 700; color: var(--primary-color); margin: 0;
`

const RecentResults = styled.div`
    background: white; border-radius: 12px; padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;
    h3 { font-size: 1rem; color: var(--text-color); margin: 0 0 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
    th { color: var(--light-text-color); font-size: 0.8rem; text-transform: uppercase; }
    tbody tr:last-child td { border-bottom: none; }
`

const UserInfo = styled.div`
    background: var(--white-color); border-radius: 12px; padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 2rem; flex-wrap: wrap;
    p { color: var(--light-text-color); font-size: 0.9rem; strong { color: var(--text-color); } }
`

export default DashboardPage
