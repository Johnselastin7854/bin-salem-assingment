import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import styles from "./table.module.css";
import { User } from "../../types";
import useFetch from "../../hooks/useFetch";

const Table = () => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [filterText, setFilterText] = useState("");

  const { data, error, isLoading } = useFetch(
    "https://jsonplaceholder.typicode.com/users"
  );

  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
    }
  }, [data]);

  const sortByName = () => {
    const sortedUser = [...data].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setFilteredData(sortedUser);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filterByCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toLowerCase();
    setFilterText(text);
    const filtered = data.filter((user) =>
      user.address.city.toLowerCase().includes(text)
    );
    setFilteredData(filtered);
  };

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        cell: (info) => info.getValue(),
        header: () => <span>ID</span>,
      }),
      columnHelper.accessor("name", {
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
      }),
      columnHelper.accessor("username", {
        cell: (info) => info.getValue(),
        header: () => <span>Username</span>,
      }),
      columnHelper.accessor("address.city", {
        cell: (info) => info.getValue(),
        header: () => <span>City</span>,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  if (isLoading) {
    return (
      <p className={styles.loader}>
        Fetching Table Data
        <img src="/loader.gif" alt="" />
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ textAlign: "center" }}>
        Error fetching data: {error.message}
      </p>
    );
  }

  const handleResetTable = () => {
    setFilteredData(data);
    setSortOrder("asc");
    setFilterText("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionContainer}>
        <div className={styles.actions}>
          <button
            onClick={sortByName}
            className={`${styles.button} ${styles.sort}`}
          >
            Sort by Name ({sortOrder === "asc" ? "Asc⬆️" : "Des⬇️"})
          </button>
          <input
            type="text"
            placeholder="Filter by City"
            value={filterText}
            onChange={filterByCity}
            className={styles.input}
          />
        </div>
        <button
          className={`${styles.button} ${styles.reset}`}
          onClick={handleResetTable}
        >
          Reset 🔄️
        </button>
      </div>

      {filteredData?.length === 0 ? (
        <p style={{ textAlign: "center" }}> No Data Found</p>
      ) : (
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Table;
