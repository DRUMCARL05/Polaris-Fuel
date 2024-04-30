"use client"

import Head from 'next/head';
import DataForm from './DataForm';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Form Input Example</title>
            </Head>
            <DataForm />
        </div>
    );
}
