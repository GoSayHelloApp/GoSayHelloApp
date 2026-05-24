import { createApi } from "@reduxjs/toolkit/query/react";
import { pythonBaseQuery } from "../../utils/baseQuery";
import type {
  GetTicketTypesResponse,
  CreateTicketRequest,
  CreateTicketResponse,
  PaymentIntentRequest,
  TicketPurchaseRequest,
  GetTicketsByEventResult,
  PurchasedTicket,
  CreatePaymentIntentResponse,
} from "../../models/responseModels/tickets";
import {
  normalizeGetTicketsByEventResponse,
  normalizePurchasedTicketsList,
  normalizePurchasedTicketDetail,
} from "../../models/responseModels/tickets";

export interface GetTicketsByEventParams {
  eventId: number;
  requestedUserId?: number;
  isUserView?: boolean;
}

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: pythonBaseQuery,
  tagTypes: ["Tickets", "TicketTypes", "PurchasedTickets"],
  endpoints: (builder) => ({
    getTicketTypes: builder.query<GetTicketTypesResponse, void>({
      query: () => ({
        url: "ticket-types",
        method: "GET",
        headers: { Accept: "application/json" },
      }),
      transformResponse: (
        raw: GetTicketTypesResponse & {
          ticket_types?: Array<{ ticket_types_id?: number; ticket_types_name?: string; id?: number; name?: string }>;
        }
      ) => {
        if (raw.ticket_types && Array.isArray(raw.ticket_types)) {
          return {
            ...raw,
            ticketTypes: raw.ticket_types.map((t) => ({
              ticket_types_id: t.ticket_types_id ?? t.id ?? 0,
              ticket_types_name: t.ticket_types_name ?? t.name ?? "",
            })),
          };
        }
        return raw;
      },
      providesTags: ["TicketTypes"],
    }),
    getTicketsByEvent: builder.query<GetTicketsByEventResult, GetTicketsByEventParams>({
      query: ({ eventId, requestedUserId, isUserView = false }) => ({
        url: `tickets/event1/${eventId}`,
        method: "GET",
        params: {
          ...(requestedUserId != null && { requestedUserId }),
          isUserView,
        },
        headers: { Accept: "application/json" },
      }),
      transformResponse: (raw: unknown): GetTicketsByEventResult => normalizeGetTicketsByEventResponse(raw),
      providesTags: (result, error, arg) => [{ type: "Tickets", id: arg.eventId }],
    }),
    createTicket: builder.mutation<CreateTicketResponse, CreateTicketRequest>({
      query: (body) => ({
        url: "tickets",
        method: "POST",
        data: body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Tickets", id: arg.eventId }],
    }),
    updateTicket: builder.mutation<CreateTicketResponse, { ticketId: number; body: CreateTicketRequest }>({
      query: ({ ticketId, body }) => ({
        url: `tickets/${ticketId}`,
        method: "PUT",
        data: body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { body }) => [{ type: "Tickets", id: body.eventId }],
    }),
    deleteTicket: builder.mutation<{ success?: boolean; message?: string }, { ticketId: number; eventId: number }>({
      query: ({ ticketId }) => ({
        url: `tickets/${ticketId}`,
        method: "DELETE",
        headers: { Accept: "application/json" },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Tickets", id: arg.eventId }],
    }),
    createPaymentIntent: builder.mutation<CreatePaymentIntentResponse, PaymentIntentRequest>({
      query: (body) => ({
        url: "create-payment-intent",
        method: "POST",
        data: {
          currency: "usd",
          tokenRedemption: 0,
          ...body,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    }),
    buyTicket: builder.mutation<Record<string, unknown>, TicketPurchaseRequest>({
      query: (body) => ({
        url: "tickets/buy",
        method: "POST",
        data: {
          intentId: "",
          totalPaidPayment: 0,
          tokenRedemption: 0,
          ...body,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, arg) => [
        ...(arg.eventId != null ? [{ type: "Tickets" as const, id: arg.eventId }] : []),
        { type: "PurchasedTickets", id: "LIST" },
      ],
    }),
    getPurchasedTickets: builder.query<PurchasedTicket[], void>({
      query: () => ({
        url: "purchased-tickets",
        method: "GET",
        headers: { Accept: "application/json" },
      }),
      transformResponse: (raw: unknown) => normalizePurchasedTicketsList(raw),
      providesTags: [{ type: "PurchasedTickets", id: "LIST" }],
    }),
    getTicketTransfers: builder.query<PurchasedTicket[], { transferType: 1 | 2 }>({
      query: ({ transferType }) => ({
        url: "ticket-transfers",
        method: "GET",
        params: { type: transferType },
        headers: { Accept: "application/json" },
      }),
      transformResponse: (raw: unknown) => normalizePurchasedTicketsList(raw),
      providesTags: [{ type: "PurchasedTickets", id: "LIST" }],
    }),
    getPurchasedTicketByTicketId: builder.query<PurchasedTicket | null, { ticketId: number }>({
      query: ({ ticketId }) => ({
        url: `purchased-ticket-by-ticket-id/${ticketId}`,
        method: "GET",
        headers: { Accept: "application/json" },
      }),
      transformResponse: (raw: unknown): PurchasedTicket | null => normalizePurchasedTicketDetail(raw),
    }),
    transferTickets: builder.mutation<
      { success?: boolean; message?: string },
      { ticketId: number; recipientEmail: string; quantity: number }
    >({
      query: (body) => ({
        url: "tickets/transfer",
        method: "POST",
        data: body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "PurchasedTickets", id: "LIST" }],
    }),
    transferTicketSingle: builder.mutation<
      { success?: boolean; message?: string },
      { purchasedTicketId: number; recipientEmail: string }
    >({
      query: (body) => ({
        url: "tickets/transfer-single",
        method: "POST",
        data: {
          purchasedTicketId: body.purchasedTicketId,
          recipientEmail: body.recipientEmail,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "PurchasedTickets", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTicketTypesQuery,
  useGetTicketsByEventQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useCreatePaymentIntentMutation,
  useBuyTicketMutation,
  useGetPurchasedTicketsQuery,
  useGetTicketTransfersQuery,
  useGetPurchasedTicketByTicketIdQuery,
  useLazyGetPurchasedTicketByTicketIdQuery,
  useTransferTicketsMutation,
  useTransferTicketSingleMutation,
} = ticketApi;
