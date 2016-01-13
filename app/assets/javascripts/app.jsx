var EmployeeDetail = React.createClass({
  loadEmployees: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [], filter: ''};
  },
  componentDidMount: function() {
    this.loadEmployees();
    setInterval(this.loadEmployees, this.props.pollInterval);
  },
  filter: function(f) {
    this.setState({filter: f});
  },
  render: function() {
    return (
      <div className="">
        <h1>Employees</h1>
        <EmployeeForm filter={this.state.filter} />
        <Employees data={this.state.data} filter={this.state.filter}/>
      </div>
    );
  }
});

var Employees = React.createClass({
  render: function() {
    var filter = this.props.filter.toLowerCase();
    var employeeNodes = this.props.data.filter(function (employee) {
        return filter.length == 0 ||
               employee.name.toLowerCase().indexOf(filter) > -1 ||
               employee.address.toLowerCase().indexOf(filter) > -1 ||
               employee.designation.toLowerCase().indexOf(filter) > -1;
    }).map(function (employee) {
      return (
        <Employee key={employee.id} id={employee.id} name={employee.name} address={employee.address} designation={employee.designation} filter={filter}/>
      );
    });

    return (
      <div className="well">
        {employeeNodes}
      </div>
    );
  }
});

var Employee = React.createClass({
  deleteEmployee: function(event) {
     var deleteUrl = "/employees/" + this.props.id + "/delete";
     $.ajax({
       url: deleteUrl,
       method: 'POST',
       cache: false,
       success: function(data) {
         console.log(data)
       }.bind(this),
       error: function(xhr, status, err) {
         console.error(deleteUrl, status, err.toString());
       }.bind(this)
     });
  },
  filterHighlight: function(str) {
    if(this.props.filter.length == 0)
        return str;
    var index = 0;
    var highlighted = str.replace(new RegExp(this.props.filter, "gi"), function (match){
        return "----(((" + match + ")))----";
    }).split("----").map(function(item) {
        if(item.slice(0, 3) == '(((' && item.slice(-3) == ')))')
           return <em key={index++}>{ item.slice(3, -3) }</em>;
        else
           return <span key={index++}>{ item }</span>;
    });
    return highlighted;
  },
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-3">
          <blockquote>
            <p>{this.filterHighlight(this.props.name)}</p>
            <strong>{this.filterHighlight(this.props.address)}</strong>
            <small>{this.filterHighlight(this.props.designation)}</small>
          </blockquote>
        </div>
        <div className="col-xs-2">
          <div>
            <div style={{padding: "5px"}}/>
            <button type="button" onClick={this.editEmployee} className="btn btn-default btn-block">
                <span className="glyphicon glyphicon-edit" style={{paddingRight: "4px"}}/>Update
            </button>
            <div style={{padding: "3px"}}/>
            <button type="button" onClick={this.deleteEmployee} className="btn btn-default btn-block">
                <span className="glyphicon glyphicon-remove" style={{paddingRight: "4px"}}/>Delete
            </button>
          </div>
        </div>
        <div className="col-xs-7"/>
      </div>
    );
  }
});

var EmployeeForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
        
    var formData = $("#employeeForm").serialize();

    var saveUrl = "/employees/save";
    $.ajax({
      url: saveUrl,
      method: 'POST',
      dataType: 'json',
      data: formData,
      cache: false,
      success: function(data) {
        console.log(data)
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(saveUrl, status, err.toString());
      }.bind(this)
    });

    // clears the form fields
    React.findDOMNode(this.refs.name).value = '';
    React.findDOMNode(this.refs.address).value = '';
    React.findDOMNode(this.refs.designation).value = '';
    return;
  },
  onFilterChange: function() {
    var filter = React.findDOMNode(this.refs.filter).value;
    rendered.filter(filter);
  },
  render: function() {
    return (
    	<div className="row">
      		<form id="employeeForm" onSubmit={this.handleSubmit}>
		        <div className="col-xs-2">
		          <div className="form-group">
		            <input type="text" name="name" required="required" ref="name" placeholder="Name" className="form-control input-block-level" />
		          </div>
		        </div>
		        <div className="col-xs-2">
		          <div className="form-group">
		            <input type="text" name="address"required="required"  ref="address" placeholder="Address" className="form-control input-block-level" />
		          </div>
		        </div>
		        <div className="col-xs-2">
		          <div className="form-group">
		            <input type="text" name="designation" required="required" ref="designation" placeholder="Designation" className="form-control input-block-level" />
		            <span className="input-icon fui-check-inverted"></span>
		          </div>
		        </div>
		        <div className="col-xs-2">
		          <button type="submit" className="btn btn-default btn-block">
                    <span className="glyphicon glyphicon-ok" style={{paddingRight: "4px"}}/>Add
                  </button>
		        </div>
		    </form>
		    <div className="col-xs-1"/>
            <div className="col-xs-3">
              <div className="form-group">
                <input type="text" name="filter" ref="filter" placeholder="Search" className="form-control input-block-level" value={this.props.filter} onChange={this.onFilterChange}/>
              </div>
            </div>
	   </div>
    );
  }
});

var rendered = React.render(<EmployeeDetail url="/employees" pollInterval={2000} />, document.getElementById('content'));
