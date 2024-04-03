import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useTable, useGlobalFilter } from 'react-table';
import moment from 'moment';
import 'moment-timezone';

const apiUrl = process.env.REACT_APP_BACKEND_URL;
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`

function Table({ columns, data ,isSearch}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter // Use global filter hook
  );
  // Render the UI for your table
  return (
    <>
      {isSearch && ( // Render search input if isSearch is true
        <input
          type="text"
          placeholder="Search..."
          value={state.globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      )}
      {/* Table */}
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [record, setRecord] = useState([]);
  const [searchQuery, setSearchQuery] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);


  useEffect(() => {
    fetchUsers(searchQuery); // Fetch users with the initial search query
    fetchDailyRecord()
  }, [searchQuery]);


  const fetchUsers = (searchQuery) => {
    let url =  `${apiUrl}/api/users`;
    if (searchQuery !== null) {
      // Update API endpoint to include search query only if it's not null
      url += `?search=${searchQuery}`;
    }
    fetch(url)
    .then((response) => response.json())
    .then((data) => {

      const parsedData = data.data.map((user) => ({
        number: data.data.indexOf(user) + 1,
        uuid: user.uuid,
        name: user.name,
        gender: user.gender,
        age: user.age,
        location: user.location
      }))
       setUsers(parsedData)
       setTotalUsers(data.meta.total); // Update total users

    })
    .catch((err) => {
       console.log(err.message);
    });
  }

  const fetchDailyRecord = () => {
    fetch( `${apiUrl}/api/daily-record`)
    .then((response) => response.json())
    .then((data) => {
      const parsedData = {
        uuid: data.data.uuid,
        date: moment().tz(data.data.date,'Asia/Jakarta').format('llll'),
        male_count: data.data.male_count,
        female_count: data.data.female_count,
        male_avg_age: data.data.male_avg_age,
        female_avg_age: data.data.female_avg_age
      };
       setRecord([parsedData]);
    })
    .catch((err) => {
       console.log(err.message);
    });
  }


  const dailyRecords = React.useMemo(
    () => [
      {
        Header: 'Daily Record',
        columns: [
          {
            Header: 'Date',
            accessor: 'date',
          },
        ],
      },
      {
        Header: 'Male',
        columns: [
          {
            Header: 'Count',
            accessor: 'male_count',
          },
          {
            Header: 'Avg Age',
            accessor: 'male_avg_age',
          },
        ],
      },
      {
        Header: 'Female',
        columns: [
          {
            Header: 'Count',
            accessor: 'female_count',
          },
          {
            Header: 'Avg Age',
            accessor: 'female_avg_age',
          },
        ],
      },

    ],
    []
  )
  const columns = React.useMemo(
    () => [
      {
            Header: 'No',
            accessor: 'number',
          },
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Gender',
            accessor: 'gender',
          },
          {
            Header: 'Location',
            accessor: 'location',
          },
          {
            Header: 'Action',
            accessor: 'delete',
            Cell: ({ row }) => (
              <button onClick={() => handleDelete(row.original.uuid)}>Delete</button>
            ),
  
          },

    ],
    []
  )

  function TotalUsers({ totalUsers }) {
    return (
      <div>
        <p>Total Users: {totalUsers}</p>
      </div>
    );
  }
  
  
  const handleDelete = (uuid) => {
    // Handle delete action
    console.log(uuid)
      fetch(`${apiUrl}/api/users/${uuid}`, {
        method: 'DELETE',
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // If the response is successful, perform any necessary actions
        console.log('User deleted successfully');
        fetchUsers(null)
        fetchDailyRecord()

        // You may want to update the UI or state here
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle any errors that occurred during the fetch
      });
    };
  
  return (
    <Styles>
      <Table columns={dailyRecords} data={record} />
      <TotalUsers totalUsers={totalUsers} />
      <Table columns={columns} data={users} isSearch={true}/>
    </Styles>
  )
}

export default App
