import React from 'react';
import {FormControl, FormField, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {CustomFormInputProps} from "@/types";
import {authFormSchema} from "@/lib/utils";

const formSchema = authFormSchema('sign-up');


const CustomFormInput = ({control, name, label, type, placeholder}: CustomFormInputProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={
                ({field}) => (
                    <div className={'form-item'}>
                        <FormLabel className={'form-label'}>
                            {label}
                        </FormLabel>
                        <div className="flex w-full flex-col">
                            <FormControl>
                                <Input
                                    placeholder={placeholder}
                                    className={'input-class'}
                                    {...field}
                                    type={type}
                                />
                            </FormControl>
                            <FormMessage className={'form-message mt-2'}/>
                        </div>
                    </div>
                )
            }
        />
    );
};

export default CustomFormInput;
