import { useCallback, useState } from 'react';

type Props = {
  initialValue: string;
  className: string;
  onBlur?: (value: string) => void;
};

export default function Editable({ initialValue, className, onBlur }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [changedString, setChangedString] = useState(initialValue);

  const updateValue = useCallback(() => {
    // do nothing if the value hasn't changed
    if (changedString === initialValue) {
      console.log('unchanged', { changedString, initialValue });
      return;
    }

    onBlur?.(changedString);
    setIsEditing(false);
  }, []);

  return (
    <div
      className={`${className} ${isEditing && 'bg-ground border rounded-lg'}`}
      onDoubleClick={() => setIsEditing((v) => !v)}
    >
      {isEditing ? (
        <input
          onChange={(e) => setChangedString(e.currentTarget.value)}
          className='w-full outline-none px-2'
          defaultValue={initialValue}
          onBlur={updateValue}
        />
      ) : (
        <span className='p-1'>{initialValue}</span>
      )}
    </div>
  );
}
