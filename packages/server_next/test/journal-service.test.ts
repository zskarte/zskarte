import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as repository from '../src/modules/journal/repository.js';
import type { JournalEntryRow } from '../src/modules/journal/schema.js';
import * as service from '../src/modules/journal/service.js';
import type { Context, Scope } from '../src/trpc/context.js';
import { TEST_OP_ID, TEST_ORG_ID, createTestContext } from './helpers/index.js';

vi.mock('../src/modules/journal/repository.js', () => ({
  list: vi.fn(),
  countAll: vi.fn(),
  findByDocumentId: vi.fn(),
  findByNumber: vi.fn(),
  findByIdentifier: vi.fn(),
  highestMessageNumber: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

const ORGANIZATION_ID = TEST_ORG_ID;
const OPERATION_ID = TEST_OP_ID;
const DOCUMENT_ID = '33333333-3333-4333-8333-333333333333';

const row = (messageNumber: number): JournalEntryRow => ({
  documentId: DOCUMENT_ID,
  operationId: OPERATION_ID,
  organizationId: ORGANIZATION_ID,
  messageNumber,
  sender: null,
  creator: null,
  communicationType: null,
  communicationDetails: null,
  messageSubject: 'Subject',
  messageContent: null,
  visumMessage: null,
  isKeyMessage: null,
  dateMessage: null,
  visumTriage: null,
  dateTriage: null,
  decision: null,
  dateDecision: null,
  dateDecisionDelivered: null,
  visumDecider: null,
  decisionReceiver: null,
  decisionSender: null,
  entryStatus: 'awaiting_message',
  department: null,
  isDrawnOnMap: null,
  isDrawingOnMap: null,
  wrongContentInfo: null,
  wrongTriageInfo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const context = async () =>
  (await createTestContext({
    role: 'organization',
    organizationId: ORGANIZATION_ID,
    requestPath: '/trpc/journal',
  })) as Context & { scope: Scope };

beforeEach(() => vi.clearAllMocks());

describe('journal service numbering', () => {
  it('allocates the next message number', async () => {
    vi.mocked(repository.highestMessageNumber).mockResolvedValue(12);
    vi.mocked(repository.insert).mockImplementation(async (_db, _scope, values) => row(values.messageNumber));
    const ctx = await context();

    const result = await service.create(ctx, OPERATION_ID, 'client-a', {});

    expect(result.messageNumber).toBe(13);
    expect(repository.insert).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ messageNumber: 13 }),
    );
  });

  it('reclaims the positive equivalent of a negative offline number', async () => {
    vi.mocked(repository.insert).mockImplementation(async (_db, _scope, values) => row(values.messageNumber));
    const ctx = await context();

    const result = await service.create(ctx, OPERATION_ID, 'client-a', { messageNumber: -7 });

    expect(result.messageNumber).toBe(7);
    expect(repository.highestMessageNumber).not.toHaveBeenCalled();
  });

  it('retries automatic allocation after a number collision', async () => {
    vi.mocked(repository.highestMessageNumber).mockResolvedValueOnce(4).mockResolvedValueOnce(5);
    vi.mocked(repository.insert)
      .mockRejectedValueOnce({ code: '23505', constraint: 'journal_entries_number_unique' })
      .mockImplementationOnce(async (_db, _scope, values) => row(values.messageNumber));
    const ctx = await context();

    const result = await service.create(ctx, OPERATION_ID, 'client-a', {});

    expect(result.messageNumber).toBe(6);
    expect(repository.insert).toHaveBeenCalledTimes(2);
  });

  it('returns conflict for an explicit duplicate number', async () => {
    vi.mocked(repository.insert).mockRejectedValue({ code: '23505', constraint: 'journal_entries_number_unique' });
    const ctx = await context();

    await expect(service.create(ctx, OPERATION_ID, 'client-a', { messageNumber: 7 })).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'messageNumber 7 already exist',
    });
  });
});
