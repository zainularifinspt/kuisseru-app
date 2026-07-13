import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  quizSessionId: text('quiz_session_id').references(() => quizSessions.id).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const options = sqliteTable('options', {
  id: text('id').primaryKey(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  text: text('text').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
});

export const quizSessions = sqliteTable('quiz_sessions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status', { enum: ['waiting', 'active', 'finished'] }).notNull().default('waiting'),
  teacherId: text('teacher_id').notNull(), // Future reference for authentication
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  quizSessionId: text('quiz_session_id').references(() => quizSessions.id).notNull(),
  nickname: text('nickname').notNull(),
  score: integer('score').notNull().default(0),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const quizSessionsRelations = relations(quizSessions, ({ many }) => ({
  questions: many(questions),
  participants: many(participants),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  quizSession: one(quizSessions, {
    fields: [participants.quizSessionId],
    references: [quizSessions.id],
  }),
  answers: many(answers),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quizSession: one(quizSessions, {
    fields: [questions.quizSessionId],
    references: [quizSessions.id],
  }),
  options: many(options),
  answers: many(answers),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  participantId: text('participant_id').references(() => participants.id).notNull(),
  questionId: text('question_id').references(() => questions.id).notNull(),
  optionId: text('option_id').references(() => options.id).notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const answersRelations = relations(answers, ({ one }) => ({
  participant: one(participants, {
    fields: [answers.participantId],
    references: [participants.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  option: one(options, {
    fields: [answers.optionId],
    references: [options.id],
  }),
}));

