import { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { fetchCourses } from '../../slices/courseSlice'
import { fetchDepartments } from '../../slices/departmentSlice'
import { fetchMyResults, fetchAllResults } from '../../slices/resultSlice'
import { fetchAllUsers } from '../../slices/userSlice'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F']
const GRADE_COLORS = {
    A: '#34d399',
    B: '#6366f1',
    C: '#818cf8',
    D: '#fbbf24',
    E: '#fb923c',
    F: '#f87171',
}

const BAR_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#0d1117',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12 } },
            border: { display: false },
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 12 }, precision: 0 },
            border: { display: false },
        },
    },
}

const DONUT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#94a3b8',
                font: { size: 13 },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 10,
            },
        },
        tooltip: {
            backgroundColor: '#0d1117',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
        },
    },
}

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

    // Admin — donut chart
    const userDistData = {
        labels: ['Students', 'Lecturers'],
        datasets: [{
            data: [studentCount, lecturerCount],
            backgroundColor: ['#6366f1', '#34d399'],
            borderColor: 'transparent',
            hoverOffset: 6,
        }],
    }

    // Admin — grade bar chart
    const gradeCountMap = {}
    allResults.forEach((r) => {
        if (r.grade) gradeCountMap[r.grade] = (gradeCountMap[r.grade] || 0) + 1
    })
    const gradeLabels = GRADE_ORDER.filter((g) => gradeCountMap[g])
    const gradeData = {
        labels: gradeLabels,
        datasets: [{
            label: 'Results',
            data: gradeLabels.map((g) => gradeCountMap[g]),
            backgroundColor: gradeLabels.map((g) => GRADE_COLORS[g] || '#6366f1'),
            borderRadius: 6,
            borderSkipped: false,
        }],
    }

    // Student — scores bar chart
    const scoreLabels = myResults.map((r) => r.course?.courseCode || 'N/A')
    const scoreData = {
        labels: scoreLabels,
        datasets: [{
            label: 'Score',
            data: myResults.map((r) => r.score),
            backgroundColor: myResults.map((r) => GRADE_COLORS[r.grade] || '#6366f1'),
            borderRadius: 6,
            borderSkipped: false,
        }],
    }
    const scoreOptions = {
        ...BAR_OPTIONS,
        scales: {
            ...BAR_OPTIONS.scales,
            y: { ...BAR_OPTIONS.scales.y, min: 0, max: 100 },
        },
    }

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
                <>
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
                            <CardLabel>Total Result Records</CardLabel>
                            <CardValue>{allResults.length}</CardValue>
                        </StatCard>
                    </Grid>

                    <ChartsRow>
                        <ChartCard>
                            <ChartTitle>User Distribution</ChartTitle>
                            {(studentCount + lecturerCount) > 0 ? (
                                <ChartWrap $height="260px">
                                    <Doughnut data={userDistData} options={DONUT_OPTIONS} />
                                </ChartWrap>
                            ) : (
                                <EmptyChart>No user data yet</EmptyChart>
                            )}
                        </ChartCard>

                        <ChartCard>
                            <ChartTitle>Grade Distribution</ChartTitle>
                            {gradeLabels.length > 0 ? (
                                <ChartWrap $height="260px">
                                    <Bar data={gradeData} options={BAR_OPTIONS} />
                                </ChartWrap>
                            ) : (
                                <EmptyChart>No result data yet</EmptyChart>
                            )}
                        </ChartCard>
                    </ChartsRow>
                </>
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
                        <ChartCard style={{ marginBottom: '1.5rem' }}>
                            <ChartTitle>Scores by Course</ChartTitle>
                            <ChartWrap $height="280px">
                                <Bar data={scoreData} options={scoreOptions} />
                            </ChartWrap>
                            <ChartLegend>
                                {Object.entries(GRADE_COLORS).map(([g, c]) => (
                                    <LegendDot key={g} $color={c}>
                                        <span className="dot" />{g}
                                    </LegendDot>
                                ))}
                            </ChartLegend>
                        </ChartCard>
                    )}

                    {myResults.length > 0 && (
                        <RecentResults>
                            <h3>Recent Results</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Semester</th>
                                        <th>Year</th>
                                        <th>Score</th>
                                        <th>Grade</th>
                                    </tr>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    h1 { font-size: 1.5rem; color: var(--text-color); margin: 0; }
    .subtitle { margin-top: 0.25rem; color: var(--light-text-color); font-size: 0.95rem; }
`

const RoleBadge = styled.span`
    padding: 0.35rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background: ${(p) => p.$role === 'admin'
        ? 'rgba(251, 191, 36, 0.15)'
        : p.$role === 'lecturer'
        ? 'rgba(99, 102, 241, 0.15)'
        : 'rgba(52, 211, 153, 0.15)'};
    color: ${(p) => p.$role === 'admin'
        ? '#fbbf24'
        : p.$role === 'lecturer'
        ? 'var(--highlight-color)'
        : 'var(--success-color)'};
`

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`

const StatCard = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
`

const CardLabel = styled.p`
    font-size: 0.85rem;
    color: var(--light-text-color);
    margin-bottom: 0.75rem;
    font-weight: 500;
`

const CardValue = styled.h2`
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
`

const ChartsRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const ChartCard = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
`

const ChartTitle = styled.h3`
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 1.25rem;
`

const ChartWrap = styled.div`
    position: relative;
    height: ${(p) => p.$height || '260px'};
`

const EmptyChart = styled.div`
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--light-text-color);
    font-size: 0.9rem;
`

const ChartLegend = styled.div`
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--stroke-color);
`

const LegendDot = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--light-text-color);

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${(p) => p.$color};
        flex-shrink: 0;
    }
`

const RecentResults = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
    margin-bottom: 1.5rem;

    h3 { font-size: 1rem; color: var(--text-color); margin: 0 0 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--stroke-color); }
    th { color: var(--light-text-color); font-size: 0.8rem; text-transform: uppercase; background: var(--secondary-color); }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: rgba(99, 102, 241, 0.05); }
`

const UserInfo = styled.div`
    background: var(--white-color);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--stroke-color);
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;

    p { color: var(--light-text-color); font-size: 0.9rem; strong { color: var(--text-color); } }
`

export default DashboardPage
