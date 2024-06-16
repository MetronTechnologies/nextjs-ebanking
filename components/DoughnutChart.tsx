'use client'

import {Chart as ChartJS, ArcElement, Legend, Tooltip} from "chart.js";
import {Doughnut} from "react-chartjs-2";
import {DoughnutChartProps} from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({accounts}: DoughnutChartProps) => {
    const accountNames = accounts.map(
        (account) => account.name
    );
    const balances = accounts.map(
        (account) => account.currentBalance
    );
    const data = {
        datasets: [
            {
                label: 'Banks',
                data: balances,
                backgroundColor: ['#0747B6', '#2265D8', '#2F91FA']
            }
        ],
        labels: accountNames
    };
    return (
        <Doughnut
            data={data}
            options={{
                cutout: '60%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }}
        />
    );
};

export default DoughnutChart;
