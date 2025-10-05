"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ComicText } from '../ui/comic-text';
import { TypingAnimation } from '../ui/typing-animation';
import { FinancialServicesDialog } from '../financial-services/FinancialServicesDialog';

export default function ITRHelperButton() {
    return (
        <FinancialServicesDialog>
            <button className='fixed bottom-4 left-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-300'>
                <TypingAnimation className='text-xl flex justify-center font-bold' loop={true}>For Saving Tax💰</TypingAnimation>
                <motion.div 
                    className='mb-1 flex gap-4'
                    animate={{
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <ComicText className='-rotate-12' fontSize={1.5}>Click</ComicText>
                    <ComicText className='rotate-12' fontSize={1.5}>Here!</ComicText>
                </motion.div>
                <motion.img 
                    src="/itr-helper-logo.png" 
                    alt="itr logo" 
                    className='h-24 w-16 text-gray-500'
                    animate={{
                        y: [0, -8, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </button>
        </FinancialServicesDialog>
    );
}