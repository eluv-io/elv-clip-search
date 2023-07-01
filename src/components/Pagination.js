import ReactPaginate from "react-paginate";

const PaginationBar = (props) => {
  return (
    <ReactPaginate
      breakLabel="..."
      nextLabel=">"
      onPageChange={props.onPageChangeHandler}
      pageRangeDisplayed={3}
      pageCount={props.pageCount}
      previousLabel="<"
      renderOnZeroPageCount={null}
      containerClassName="pagination justify-content-center"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      activeClassName="active"
    />
  );
};

export default PaginationBar;
