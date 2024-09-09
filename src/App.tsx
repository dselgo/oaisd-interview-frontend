import { useMemo, useState } from 'react'
import styled from 'styled-components';
import { TextField, Button, CircularProgress } from '@mui/material'

import underLimitImage from './assets/underLimit.gif';
import overLimitImage from './assets/overLimit.gif';
import './App.css';

import type { WholeNumber } from './types'

const StyledPage = styled.div`
  width: 100%;
  text-align: center;

  .inputBar {
    display: flex;
    gap: 16px;
  }

  .inputBar__button {
    text-wrap: nowrap;
    font-weight: 600;
  }

  .results {
    margin-top: 16px;
    width: 100%;
    display: flex;
    gap: 16px;
  }

  .results__item {
    margin: auto;
  }

  .results__list {
    list-style-type: none;
  }

  .results__listItem {
    font-size: 20px;
  }
`;

const LIMIT = 9000;

const compareWholeNumbers = (a: WholeNumber, b: WholeNumber): number => {
  if(a.text < b.text) return -1;
  if(a.text > b.text) return 1;
  return 0;
}

const App = () => {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState<WholeNumber[]>([]);

  const formattedData: string[] = useMemo(() => (
    data.filter((d) => d.num >= LIMIT * -1 && d.num <= LIMIT)
      .sort(compareWholeNumbers)
      .map((d) => d.text
        .toLowerCase()
        .split(' ')
        .map((token) => `${token[0].toUpperCase()}${token.substring(1)}`)
        .join(' ')
      )
  ), [data]);

  const underLimitCount = data.filter((d) => d.num < LIMIT * -1).length;
  const overLimitCount = data.filter((d) => d.num > LIMIT).length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    setError('');
  }

  const handleSubmit = () => {
    setData([]);
    setIsFetching(true);

    fetch(`https://localhost:7271/numToText/${encodeURIComponent(value)}`, { method: 'GET' })
      .then(response => {
        if(response.ok) {
          response.json().then((d) => setData(d));
        } else if(response.status === 400) {
          response.json().then((e) => setError(e));
        } else {
          console.error("Something went wrong")
        }
        setIsFetching(false);
      }).catch((e) => {
        console.error(e);
        setIsFetching(false);
      })
  }

  return (
    <StyledPage>
      <h1>Number to Text Converter</h1>
      <h3>Please enter a list of numbers separated by commas, and then press the <b>Sort Text</b> button</h3>
      <div className='inputBar'>
        <TextField 
          placeholder='(e.g. 1,12,300,-5000)'
          required
          fullWidth
          error={!!error}
          helperText={error}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button
          className='inputBar__button'
          variant='contained'
          disabled={!value || !!error || isFetching}
          onClick={handleSubmit}
        >Sort Text
        </Button>
      </div>
      <div className='results'>
        {isFetching
          ? <CircularProgress className='results__item' />
          : (
            <>
              {underLimitCount > 0 && (
                <img className='results__item' src={underLimitImage} title={`Count: ${underLimitCount}`} />
              )}
              {formattedData.length > 0 && (
                <ul className='results__item results__list'>
                  {formattedData.map((d, i) => (
                    <li className='results__listItem' key={i}>{d}</li>
                  ))}
                </ul>
              )}
              {overLimitCount > 0 && (
                <img className='results__item' src={overLimitImage} title={`Count: ${overLimitCount}`} />
              )}
              {formattedData.length === 0 && underLimitCount === 0 && overLimitCount === 0 && (
                <h2 className='results__item'>No data available</h2>
              )}
            </>
          )
        }
      </div>
    </StyledPage>
  )
}

export default App;
