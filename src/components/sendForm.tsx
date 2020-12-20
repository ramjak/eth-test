import React, {ChangeEvent, useCallback, useState} from 'react';

interface IFormValue {
    to: string,
    amount: number
}

interface IProps {
    onSubmit: (val: IFormValue) => any
}

const initValue: IFormValue = { amount: 0, to: '' };

function SendForm({onSubmit}: IProps) {
    const [value, setValue] = useState<IFormValue>(initValue);

    const onChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        const { value, name } = target;
        setValue(state => ({ ...state, [name]: value }));
    }, []);

    const handleSubmit = useCallback(() => {
        onSubmit(value);
        setValue(initValue);
    }, [onSubmit, value]);

    return (
        <div>
            <div>Recipient</div>
            <input type="text" onChange={onChange} name="to" value={value.to} /><br/>
            <div>Amount: </div>
            <input type="number" onChange={onChange} name="amount" value={value.amount} /><br/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default SendForm;