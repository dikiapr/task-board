import { nanoid } from 'nanoid';
import type { Attachment, Column, Subtask, Task, TaskInput } from '../types/task';
import { addDays, todayISO } from '../utils/date';
import { detectAttachmentType } from '../utils/attachment';
import { DEFAULT_COLUMNS, DUMMY_COVERS } from './constants';

const checklist = (items: [string, boolean][]): Subtask[] =>
  items.map(([title, done]) => ({ id: nanoid(), title, done }));

const attachments = (names: string[]): Attachment[] =>
  names.map((name) => {
    const type = detectAttachmentType(name);
    if (!type) throw new Error(`Seed attachment "${name}" is not an allowed format`);
    return { id: nanoid(), name, type };
  });

export const createDefaultColumns = (): Column[] => DEFAULT_COLUMNS.map((c) => ({ ...c }));

export const createSeedTasks = (): Task[] => {
  const today = todayISO();
  const inDays = (n: number) => addDays(today, n);

  const tasks: TaskInput[] = [
    // ---------- To Do ----------
    {
      columnId: 'todo',
      title: 'Research for a podcast and video website',
      description: 'Compare hosting platforms and list the must-have features for the first release.',
      assigneeIds: ['m1', 'm3'],
      dueDate: inDays(4),
      label: 'Feature',
      priority: 'Medium',
      subtasks: checklist([
        ['List competitor websites', true],
        ['Compare hosting platforms', false],
        ['Summarize findings', false],
      ]),
      attachments: attachments(['research-notes.docx']),
    },
    {
      columnId: 'todo',
      title: 'Debug checkout process for the e-commerce website',
      description: 'Payment step sometimes fails on mobile Safari after applying a voucher.',
      assigneeIds: ['m2', 'm4', 'm5'],
      dueDate: inDays(-1),
      label: 'Bug',
      priority: 'High',
      subtasks: checklist([
        ['Reproduce on iOS', true],
        ['Check voucher API response', true],
        ['Fix total calculation', false],
        ['Add regression test', false],
      ]),
      attachments: attachments(['checkout-error.jpg', 'bug-report.docx']),
    },
    {
      columnId: 'todo',
      title: 'Prepare workspace photos for the company profile',
      description: 'Pick the best office photos and crop them for the website hero section.',
      assigneeIds: ['m6'],
      dueDate: inDays(9),
      label: 'Undefined',
      subtasks: [],
      attachments: [],
      coverImage: DUMMY_COVERS[1],
    },

    // ---------- Doing ----------
    {
      columnId: 'doing',
      title: 'Design wireframes for the landing page revamp',
      description: 'Low-fidelity wireframes for hero, pricing, and testimonial sections.',
      assigneeIds: ['m4', 'm1'],
      dueDate: today,
      label: 'Feature',
      priority: 'High',
      subtasks: checklist([
        ['Hero section', true],
        ['Pricing section', false],
      ]),
      attachments: attachments(['landing-wireframe.pdf']),
    },
    {
      columnId: 'doing',
      title: 'Install and set up a marketing tool for team operations',
      description: 'Set up accounts, connect the newsletter list, and invite the marketing team.',
      assigneeIds: ['m2', 'm3', 'm6'],
      dueDate: inDays(6),
      label: 'Undefined',
      priority: 'Low',
      subtasks: checklist([
        ['Create workspace', true],
        ['Import contacts', true],
        ['Invite team', true],
        ['Create first campaign', false],
        ['Set up tracking', false],
      ]),
      attachments: attachments(['pricing-plan.pdf']),
      coverImage: DUMMY_COVERS[3],
    },

    // ---------- Review ----------
    {
      columnId: 'review',
      title: 'Create and refine logo designs for the UI brand',
      description: 'Three logo alternatives with light and dark versions.',
      assigneeIds: ['m5', 'm3'],
      dueDate: inDays(2),
      label: 'Issue',
      priority: 'Medium',
      subtasks: checklist([
        ['Sketch concepts', true],
        ['Vectorize', true],
        ['Dark version', false],
      ]),
      attachments: attachments(['logo-v3.jpeg', 'brand-guideline.pdf']),
      coverImage: DUMMY_COVERS[0],
    },
    {
      columnId: 'review',
      title: 'Create an icon library for the project.',
      description: 'Consistent 24px outline icons exported as SVG.',
      assigneeIds: ['m3', 'm5'],
      dueDate: inDays(1),
      label: 'Feature',
      subtasks: checklist([
        ['Navigation icons', true],
        ['Action icons', true],
        ['Status icons', false],
        ['Export SVG', false],
      ]),
      attachments: [],
    },

    // ---------- Done ----------
    {
      columnId: 'done',
      title: 'Create the Email Page layout and necessary components',
      description: 'Inbox list, email detail, and compose modal.',
      assigneeIds: ['m5', 'm3'],
      dueDate: inDays(-5),
      label: 'Feature',
      subtasks: checklist([
        ['Inbox list', true],
        ['Email detail', true],
        ['Compose modal', true],
      ]),
      attachments: attachments(['email-page-spec.pdf']),
    },
    {
      columnId: 'done',
      title: 'Enhance website usability through user feedback',
      description: 'Apply the top five improvements from the last usability test.',
      assigneeIds: ['m4', 'm2'],
      dueDate: null,
      label: 'Feature',
      subtasks: [],
      attachments: attachments(['usability-report.pdf']),
    },

    // ---------- Rework ----------
    {
      columnId: 'rework',
      title: 'Blog Edit Page Modification and Playlist Page Design',
      description: 'Revise spacing and typography based on review feedback.',
      assigneeIds: ['m4', 'm3'],
      dueDate: inDays(3),
      label: 'Feature',
      priority: 'Medium',
      subtasks: checklist([
        ['Fix spacing', true],
        ['Update typography', false],
        ['Playlist empty state', false],
      ]),
      attachments: attachments(['review-feedback.pdf']),
    },
    {
      columnId: 'rework',
      title: 'Plan and execute training sessions for new hires',
      description: 'Onboarding schedule for the first two weeks, including mentoring pairs.',
      assigneeIds: ['m1', 'm5'],
      dueDate: inDays(5),
      label: 'Issue',
      priority: 'Low',
      subtasks: checklist([
        ['Draft schedule', true],
        ['Book meeting rooms', false],
        ['Assign mentors', false],
      ]),
      attachments: [],
      coverImage: DUMMY_COVERS[2],
    },
  ];

  const createdAt = new Date().toISOString();
  return tasks.map((task) => ({
    ...task,
    id: nanoid(),
    createdAt,
    activity: [{ id: nanoid(), message: 'Created this task', at: createdAt }],
  }));
};
