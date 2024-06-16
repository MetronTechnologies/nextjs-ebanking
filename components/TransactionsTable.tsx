import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Transaction, TransactionTableProps} from "@/types";
import {formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters} from "@/lib/utils";
import CategoryBadge from "@/components/CategoryBadge";



const TransactionsTable = ({transactions}: TransactionTableProps) => {
    return (
        <Table>
            <TableHeader className={'bg-[#f9fafb]'}>
                <TableRow>
                    <TableHead className={'px-1'}>Transaction</TableHead>
                    <TableHead className={'px-1'}>Amount</TableHead>
                    <TableHead className={'px-1'}>Status</TableHead>
                    <TableHead className={'px-1'}>Date</TableHead>
                    <TableHead className={'px-1 max-md:hidden'}>Channel</TableHead>
                    <TableHead className={'px-1 max-md:hidden'}>Category</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    transactions?.map(
                        (tx: Transaction) => {
                            const status = getTransactionStatus(new Date(tx.date));
                            const amount = formatAmount(tx.amount);
                            const isDebit = tx.type === 'debit';
                            const isCredit = tx.type === 'credit';
                            return (
                                <TableRow
                                    key={tx.id}
                                    className={
                                        `
                                            ${isDebit || amount[0] === '-'} ? 
                                            'bg-[#fffbfa]' : 'bg-[#f6fef9]'
                                            !over:bg-none !border-b-DEFAULT
                                        `
                                    }
                                >
                                    <TableCell className={'max-w-[250px] pl-1 pr-6'}>
                                        <div className="flex items-center gap-3">
                                            <h1 className={'text-14 truncate font-semibold text-[#344054]'}>
                                                {removeSpecialCharacters(tx.name)}
                                            </h1>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className={
                                            `
                                                pl-1 pr-10 font-semibold
                                                ${isDebit || amount[0] === '-'} ? 
                                                'text-[#f04438]' : 'text-[#039855]'
                                            `
                                        }
                                    >
                                        {
                                            isDebit ? (
                                                `-${amount}`
                                            ) : (
                                                isCredit ? (
                                                    amount
                                                ) : (
                                                    amount
                                                )
                                            )
                                        }
                                    </TableCell>
                                    <TableCell className={'pl-1 pr-5'}>
                                        <CategoryBadge category={status} />
                                    </TableCell>
                                    <TableCell className={'pl-1 pr-5 min-w-30'}>
                                        {formatDateTime(new Date(tx.date)).dateTime}
                                    </TableCell>
                                    <TableCell className={'pl-1 pr-5 capitalize min-w-24'}>
                                        {tx.paymentChannel}
                                    </TableCell>
                                    <TableCell className={'pl-1 pr-5 max-md:hidden'}>
                                        <CategoryBadge category={tx.category} />
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    )
                }
            </TableBody>
        </Table>
    );
};

export default TransactionsTable;
