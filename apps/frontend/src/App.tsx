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
    // TODO: Send to backend via WebSocket
  };

  const handleQuestionToggle = (open: boolean) => {
    setAskOpen(open);
  };

  const handleQuestionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('Question submitted:', {
      courseId,
      slideId,
      topic,
      question: formData.get('question.body'),
      anonymous: formData.get('question.anonymous'),
    });
    setAskOpen(false);
    // TODO: Send to backend
  };

  const handleStudyAction = (action: string, payload: Record<string, unknown>) => {
    console.log('Study action:', action, payload);
    // TODO: Trigger AgentKit workflow
  };

  const handleInstructorAction = (action: string, payload: Record<string, unknown>) => {
    console.log('Instructor action:', action, payload);
    // TODO: Trigger backend action
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <Card size="md" status={{ text: statusText, icon: 'globe' }}>
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
    </div>
  );
}

export default App;
