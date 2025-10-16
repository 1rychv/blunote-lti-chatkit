import { useState } from 'react';
import {
  Card,
  Col,
  Row,
  Title,
  Spacer,
  Select,
  Button,
  Form,
  Textarea,
  Checkbox,
  Divider,
  Text,
  Badge,
  Caption,
  Chart,
  Icon,
} from './components/ui';
import * as api from './lib/api';
import { ChatPanel } from './components/ChatPanel';

interface LTIContext {
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  role: 'Learner' | 'Instructor';
}

interface ConfusionMetrics {
  improvement: string;
}

interface SpikeData {
  active: boolean;
  message: string;
}

function App() {
  // TODO: Load from backend session bootstrap
  const [ltiContext] = useState<LTIContext>({
    userId: 'user123',
    userName: 'Student',
    courseId: 'course456',
    courseName: 'Introduction to Computer Science',
    role: 'Learner',
  });

  const [viewMode, setViewMode] = useState<'student' | 'instructor'>(
    ltiContext.role === 'Instructor' ? 'instructor' : 'student'
  );
  const [askOpen, setAskOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();

  // Mock data
  const metrics: ConfusionMetrics = { improvement: '22%' };
  const spike: SpikeData = {
    active: true,
    message: '8 students confused in last 2 minutes — consider pausing',
  };

  const chartData = [
    { label: 'Slide 1', confused: 15 },
    { label: 'Slide 2', confused: 8 },
    { label: 'Slide 3', confused: 25 },
    { label: 'Slide 4', confused: 12 },
    { label: 'Slide 5', confused: 30 },
  ];

  const viewOptions = [
    { label: 'Student', value: 'student' },
    { label: 'Instructor', value: 'instructor' },
  ];

  const statusText = 'LTI 1.3 • SSO active • ' + (ltiContext.courseName || 'Course');
  const courseId = ltiContext.courseId;
  const slideId = 'slide-current';
  const topic = 'Binary Search Trees';

  const handleViewSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(e.target.value as 'student' | 'instructor');
  };

  const handleConfusionPulse = () => {
    console.log('Confusion pulse:', { courseId, slideId, topic, anonymous: true });
    setChatInitialMessage(`I'm confused about ${topic}`);
  };

  const handleQuestionToggle = (open: boolean) => {
    setAskOpen(open);
  };

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const questionBody = formData.get('question.body') as string;
    const anonymous = formData.get('question.anonymous') === 'on';

    console.log('Question submitted:', {
      courseId,
      slideId,
      topic,
      question: questionBody,
      anonymous,
    });

    try {
      const result = await api.submitQuestion({
        user_id: ltiContext.userId,
        course_id: courseId,
        question: questionBody,
        anonymous,
        topic,
        slide_id: slideId,
      });
      console.log('Question saved:', result);
      alert(result.response);
      setAskOpen(false);
    } catch (error) {
      console.error('Failed to submit question:', error);
      alert('Failed to submit question. Please try again.');
    }
  };

  const handleStudyAction = (action: string, payload: Record<string, unknown>) => {
    console.log('Study action:', action, payload);
    let message = '';
    if (action === 'study.quiz') {
      message = `Generate a quiz focused on ${payload.focus || 'confusion-zones'}`;
    } else if (action === 'study.explain') {
      message = `Explain ${payload.topic || topic} again`;
    } else if (action === 'study.notes') {
      message = `Show me notes for ${payload.topic || topic}`;
    }
    setChatInitialMessage(message);
  };

  const handleInstructorAction = async (action: string, payload: Record<string, unknown>) => {
    console.log('Instructor action:', action, payload);
    try {
      let result;
      if (action === 'heatmap.refresh') {
        result = await api.getConfusionHeatmap({
          user_id: ltiContext.userId,
          course_id: courseId,
          time_range: 'today',
        });
      } else if (action === 'intervention.export') {
        result = await api.exportConfusionData({
          user_id: ltiContext.userId,
          course_id: courseId,
          format: 'csv',
        });
      } else if (action === 'intervention.notify' || action === 'intervention.assign') {
        result = await api.sendMessage({
          message: `${action === 'intervention.notify' ? 'Send notifications' : 'Assign quizzes'} to confused students`,
          user_id: ltiContext.userId,
          course_id: courseId,
          role: 'instructor',
        });
      }
      if (result) {
        console.log('Instructor action result:', result);
        alert(result.response);
      }
    } catch (error) {
      console.error('Failed to execute instructor action:', error);
      alert('Action failed. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: '#fff',
                  fontSize: '18px',
                }}
              >
                B
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', lineHeight: '1.2' }}>
                  BluNote
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.2' }}>
                  {ltiContext.courseName}
                </div>
              </div>
            </div>
            <Spacer />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge label={ltiContext.role} color={ltiContext.role === 'Instructor' ? 'info' : 'success'} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {ltiContext.userName}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  LTI 1.3 • SSO Active
                </div>
              </div>
            </div>
          </Row>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <Card size="md">
        <Col gap={3}>
          <Row>
            <Title value="Class Assist" size="sm" />
            <Spacer />
            <Select
              name="view.mode"
              options={viewOptions}
              defaultValue={viewMode}
              variant="ghost"
              onChange={handleViewSwitch}
            />
          </Row>

          {viewMode === 'student' ? (
            <Col gap={3}>
              <Row gap={2}>
                <Button label="I'm Confused" iconStart="circle-question" onClick={handleConfusionPulse} />
                {!askOpen ? (
                  <Button
                    label="Ask a Question"
                    variant="outline"
                    iconStart="write-alt"
                    onClick={() => handleQuestionToggle(true)}
                  />
                ) : (
                  <Button
                    label="Close"
                    variant="outline"
                    iconStart="chevron-left"
                    onClick={() => handleQuestionToggle(false)}
                  />
                )}
              </Row>

              {askOpen && (
                <Form onSubmit={handleQuestionSubmit}>
                  <Col gap={2}>
                    <Textarea name="question.body" placeholder="Type your question" required rows={3} />
                    <Checkbox name="question.anonymous" label="Ask anonymously" defaultChecked />
                    <Row>
                      <Spacer />
                      <Button submit label="Send" style="primary" iconStart="mail" />
                    </Row>
                  </Col>
                </Form>
              )}

              <Divider />
              <Col gap={2}>
                <Row>
                  <Text value="Study tools" size="sm" weight="semibold" />
                  <Spacer />
                  <Badge label={`Improved ${metrics.improvement}`} color="success" />
                </Row>
                <Row gap={2}>
                  <Button
                    label="Quiz Me"
                    variant="outline"
                    iconStart="notebook-pencil"
                    onClick={() =>
                      handleStudyAction('study.quiz', { courseId, focus: 'confusion-zones' })
                    }
                  />
                  <Button
                    label="Explain Again"
                    variant="outline"
                    iconStart="lightbulb"
                    onClick={() => handleStudyAction('study.explain', { courseId, topic })}
                  />
                  <Button
                    label="Review Notes"
                    variant="outline"
                    iconStart="book-open"
                    onClick={() => handleStudyAction('study.notes', { courseId, slideId })}
                  />
                </Row>
              </Col>
              <Caption value="Anonymous by default • FERPA/GDPR friendly" color="secondary" />
            </Col>
          ) : (
            <Col gap={3}>
              <Row>
                <Text value="Live confusion heatmap" size="sm" weight="semibold" />
                <Spacer />
                <Button
                  iconStart="reload"
                  label="Refresh"
                  variant="outline"
                  onClick={() => handleInstructorAction('heatmap.refresh', { courseId })}
                />
              </Row>
              <Chart
                data={chartData}
                series={[
                  { type: 'bar', dataKey: 'confused', label: '% Confused', color: 'orange' },
                ]}
                xAxis={{ dataKey: 'label' }}
                showYAxis
              />
              {spike.active && (
                <Row
                  padding={{ y: 2, x: 2 }}
                  background="yellow-100"
                  radius="sm"
                  border={{ size: 1 }}
                >
                  <Icon name="info" />
                  <Text value={spike.message} size="sm" color="warning" />
                </Row>
              )}
              <Row>
                <Button
                  label="Export CSV"
                  variant="outline"
                  iconStart="external-link"
                  onClick={() => handleInstructorAction('intervention.export', { courseId })}
                />
                <Button
                  label="Notify via LMS"
                  variant="outline"
                  iconStart="mail"
                  onClick={() => handleInstructorAction('intervention.notify', { courseId })}
                />
                <Spacer />
                <Button
                  label="Assign quizzes"
                  style="secondary"
                  onClick={() => handleInstructorAction('intervention.assign', { courseId })}
                />
              </Row>
              <Caption value="SSO via LTI 1.3 • <100ms target • Sync on" color="secondary" />
            </Col>
          )}
        </Col>
      </Card>

        {/* Chat Assistant */}
        <div style={{ marginTop: '1rem' }}>
          <ChatPanel
            userId={ltiContext.userId}
            courseId={courseId}
            role={viewMode}
            initialMessage={chatInitialMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
