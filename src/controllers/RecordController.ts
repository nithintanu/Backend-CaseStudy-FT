import type { Request, Response } from 'express';
import RecordService from '../services/RecordService';
import { asyncHandler } from '../utils/asyncHandler';

const RecordController = {
  parseRecordFilters(req: Request) {
    return {
      type: req.query.type as 'income' | 'expense' | undefined,
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      query: req.query.query as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
  },

  createRecord: asyncHandler(async (req: Request, res: Response) => {
    const record = await RecordService.createRecord(
      req.user!.id,
      req.validatedData as {
        amount: number;
        type: 'income' | 'expense';
        category: string;
        description?: string | null;
        date?: string;
        currency?: string;
      },
    );

    res.status(201).json(record);
  }),

  getRecordById: asyncHandler(async (req: Request, res: Response) => {
    const record = await RecordService.getRecordById(Number(req.params.id), req.user);
    res.status(200).json(record);
  }),

  getUserRecords: asyncHandler(async (req: Request, res: Response) => {
    const records = await RecordService.getUserRecords(req.user!.id, RecordController.parseRecordFilters(req));

    res.status(200).json(records);
  }),

  getAllRecords: asyncHandler(async (req: Request, res: Response) => {
    const records = await RecordService.getAllRecords({
      ...RecordController.parseRecordFilters(req),
      userId: req.query.userId ? Number(req.query.userId) : undefined,
    });

    res.status(200).json(records);
  }),

  updateRecord: asyncHandler(async (req: Request, res: Response) => {
    const record = await RecordService.updateRecord(
      Number(req.params.id),
      req.validatedData as {
        amount?: number;
        type?: 'income' | 'expense';
        category?: string;
        description?: string | null;
        date?: Date;
        currency?: string;
      },
      req.user!,
    );

    res.status(200).json(record);
  }),

  getUserRecordSummary: asyncHandler(async (req: Request, res: Response) => {
    const summary = await RecordService.getUserRecordSummary(req.user!.id);
    res.status(200).json(summary);
  }),

  deleteRecord: asyncHandler(async (req: Request, res: Response) => {
    await RecordService.deleteRecord(Number(req.params.id), req.user!);
    res.status(204).send();
  }),
};

export default RecordController;
