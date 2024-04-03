import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useTable, useGlobalFilter } from 'react-table';

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
    let url = 'http://127.0.0.1:8000/api/users';
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
        firstName: JSON.parse(user.name).first,
        lastName: JSON.parse(user.name).last,
        gender: user.gender,
        age: user.age,
        location: user.location,
      }));
       setUsers(parsedData);
       setTotalUsers(parsedData.length); // Update total users

    })
    .catch((err) => {
       console.log(err.message);
    });
  }

  const fetchDailyRecord = () => {
    fetch('http://127.0.0.1:8000/api/daily-record')
    .then((response) => response.json())
    .then((data) => {
      console.log(data.data)
      // const parsedData = data.map((record) => ({
      //   number: data.indexOf(record) + 1,
      //   uuid: record.uuid,
      //   date: record.date,
      //   male_count: record.male_count,
      //   female_count: record.female_count,
      //   male_avg_age: record.male_avg_age,
      //   female_avg_age: record.female_avg_age,
      // }));
      // console.log(parsedData)
       setRecord([data.data]);
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
          {
            Header: 'Total User',
            accessor: 'total_user',
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
        Header: 'Name',
        columns: [
          {
            Header: 'No',
            accessor: 'number',
          },
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
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
      fetch(`http://127.0.0.1:8000/api/users/${uuid}`, {
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
