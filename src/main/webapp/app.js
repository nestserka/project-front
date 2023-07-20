let array_length = 0;
var table_size = parseInt($("#table_size").val());
var start_index = 1;
var end_index = 10;
var current_index = 1;
var max_index = 0; 
const editIconURL = "../img/edit.svg";
const deleteIconURL = "../img/delete.svg";
const saveIconUrl = "../img/save.svg";

$(document).ready(function() {
    $.ajax({
      method: "GET",
      url: "/rest/players",
      dataType: "json",
      success: function(response) {
        $.each(response, function(key, value) {
          let birthdayDate = new Date(value.birthday);
          let formattedBirthday = birthdayDate.toLocaleDateString("en-GB");
          $('#players').append("<tr>\
                              <td>" + value.id + "</td>\
                              <td>" + value.name + "</td>\
                              <td>" + value.title + "</td>\
                              <td>" + value.race + "</td>\
                              <td>" + value.profession + "</td>\
                              <td>" + value.level + "</td>\
                              <td>" + formattedBirthday + "</td>\
                              <td>" + value.banned + "</td>\
                              <td>\
                              <button class='edit-button' onclick='handleEditAccount(this)'><img src='" + editIconURL + "' alt='edit' style='width: 24px; height: 24px; cursor: pointer;'></button>\
                              <button class='save-button' style='display: none;'><img src='" + saveIconUrl + "' alt='save' style='width: 24px; height: 24px; cursor: pointer;'></button>\
                            </td>\
                            <td><button class='delete-button' onclick='handleDeleteClick(" + value.id + ")'><img src='" + deleteIconURL + "' alt='delete' style='width: 24px; height: 24px; cursor: pointer;'></button></td>\
                            </tr>");
        });
      }
    });
  
    let getPlayersCount = () => {
      return $.ajax({
        method: "GET",
        url: "/rest/players/count",
        dataType: "json"
      });
    };
  
    getPlayersCount()
      .then(data => {
        array_length = parseInt(data);
        console.log("Player count:", playerCount);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  });

 function preLoadCalculations(){
    max_index = Math.floor(array_length / table_size);
    if ((array_length % table_size) >0){
        max_index++;
    }
 }


 function displayIndexOfButtons(){
    preLoadCalculations();
    $(".index_buttons button").remove()
    $(".index_buttons").append('<button onclick="prev();">Previous</button>')

    for (var i=1; i<=max_index; i++) {
        $(".index_buttons").append('<button onclick="indexPagination('+i+');" index="'+i+'">'+i+'</button>')
    }
    $(".index_buttons").append('<button onclick="next();">Next</button>');
    highlightIndexButton();

 }


 function highlightIndexButton(){
    start_index = ((current_index -1) * table_size +1);
    end_index = (start_index + table_size)  -1;
    if (end_index > array_length){
        end_index = array_length;
    }

    $(".footer span").text('Showing '+start_index+' to '+end_index+' of '+array_length+' entries');
    $(".index_buttons button").removeClass('active')
    $(".index_buttons button[index='"+current_index+"']").addClass('active');
 
}

 displayIndexOfButtons();

 function next(){
    if (current_index < max_index){ 
    current_index++;
    highlightIndexButton();
    getUsersWithPagination(current_index, table_size);
    }
}

function prev(){
    if (current_index >1){ 
    current_index--;
    highlightIndexButton();
    getUsersWithPagination(current_index, table_size);
    }
}

function indexPagination(index){
    current_index = parseInt(index);
    highlightIndexButton();
    getUsersWithPagination(current_index, table_size);
}

$("#table_size").change(function(){
    table_size = parseInt($(this).val());
    current_index = 1;
    start_index = 1;
    displayIndexOfButtons();
    getUsersWithPagination(current_index, table_size);
});

function getUsersWithPagination(pageNumber, pageSize) {
    $.ajax({
      method: "GET",
      url: "/rest/players",
      data: {
        pageNumber: pageNumber,
        pageSize: pageSize
      },
      dataType: "json",
      success: function(response) {
        $('#players').empty();
        $.each(response, function(key, value) {
          let birthdayDate = new Date(value.birthday);
          let formattedBirthday = birthdayDate.toLocaleDateString("en-GB");
          $('#players').append("<tr>\
                              <td>" + value.id + "</td>\
                              <td>" + value.name + "</td>\
                              <td>" + value.title + "</td>\
                              <td>" + value.race + "</td>\
                              <td>" + value.profession + "</td>\
                              <td>" + value.level + "</td>\
                              <td>" + formattedBirthday + "</td>\
                              <td>" + value.banned + "</td>\
                              <td>\
                              <button class='edit-button' onclick='handleEditAccount(this)'><img src='" + editIconURL + "' alt='edit' style='width: 24px; height: 24px; cursor: pointer;'></button>\
                              <button class='save-button' style='display: none;'><img src='" + saveIconUrl + "' alt='save' style='width: 24px; height: 24px; cursor: pointer;'></button>\
                            </td>\
                            <td><button class='delete-button' onclick='handleDeleteClick(" + value.id + ")'><img src='" + deleteIconURL + "' alt='delete' style='width: 24px; height: 24px; cursor: pointer;'></button></td>\
                            </tr>");
        });
      },
      error: function(error) {
        console.error("Error fetching users:", error);
      }
    });
}

function handleDeleteClick(id){ 
$.ajax({
    url: '/rest/players/' + id,
    method: 'DELETE',
    contentType: 'application/json',
    success: function(result) {
    getUsersWithPagination(current_index, table_size)
    },
    error: function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 404) {
          alert("Player not found with ID:", id);
        } else if (jqXHR.status === 400) {
          alert("Invalid ID value:", id);
        } else {
          alert("Error deleting user:", errorThrown);
        }
      }
    });
}

function handleEditAccount(button) {
    let row = $(button).closest('tr');
  
    row.find('.edit-button').hide();
    row.find('.save-button').show();
  
}


  
$(document).on('click', '.edit-button', function () {
    handleEditAccount(this);
});
  $(document).on('click', '.save-button', function () {
    handleSaveAccount(this);
});

$('form').submit(function (e) {
    e.preventDefault();

    let name = $('#name').val();
    let title = $('#title').val();
    let race = $('#race').val();
    let profession = $('#profession').val();
    let birthday = $('#date').val();
    let banned = $('#banned').val();
    let level = $('#level').val();

    if (!name || !title || !race || !profession || !birthday || banned === null || banned === "") {
        const errorMessage = "One or more required fields are empty.";
        console.error(errorMessage);
        throw new Error(errorMessage); 
    }

    if (name.length === 1 || title.length === 1) {
        alert("Name and title must contain more than one character.");
        return; 
    }
    const data = {
        name: name,
        title: title,
        race: race,
        profession: profession,
        birthday: birthday,
        banned: banned,
        level: level,
    };
    $.ajax({
      type: 'POST',
      url: '/rest/players',
      data: JSON.stringify(data),
      contentType: 'application/json',
    })
      .done((data) => {
        console.log({ data });
        location.reload()
      })
      .fail((xhr, status, error) => {
        console.error(error);
        if (xhr.status === 400) {
            console.error("Error 400: Bad Request");
        }
        location.reload();
    })
      .always(() => {
        console.log('always called');
        location.reload()
      });
  });