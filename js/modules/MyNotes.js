import $ from 'jquery';

class MyNotes {
  constructor() {
    this.events();
  }

  events() {
    $("#my-notes").on("click", ".delete-note", this.deleteNote);
    $("#my-notes").on("click", ".edit-note", this.editNote.bind(this));
    $("#my-notes").on("click", ".update-note", this.updateNote.bind(this));
    $(".submit-note").on("click", this.createNote.bind(this));
  }

  editNote(e) {
    const note = $(e.target).parents("li");
    if (note.data("state") == "editable") {
      this.makeNoteReadOnly(note);
    } else {
      this.makeNoteEditable(note);
    }
  }

  makeNoteEditable(note) {
    note.find(".edit-note").html('<i class="fa fa-times" aria-hidden="true"></i>Cancel');
    note.find(".note-title-field, .note-body-field").removeAttr("readonly").addClass("note-active-field");
    note.find(".update-note").addClass("update-note--visible");
    note.data("state", "editable");
  }

  makeNoteReadOnly(note) {
    note.find(".edit-note").html('<i class="fa fa-pencil" aria-hidden="true"></i>Edit');
    note.find(".note-title-field, .note-body-field").attr("readonly", "readonly").removeClass("note-active-field");
    note.find(".update-note").removeClass("update-note--visible");
    note.data("state", "cancel");
  }

  deleteNote(e) {
    const note = $(e.target).parents("li");
    $.ajax({
      beforeSend: (xhr) => {
        xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
      },
      url: universityData.root_url + '/wp-json/wp/v2/note/' + note.data('id'),
      type: 'DELETE',
      success: (response) => {
        note.slideUp();
        if (response.userNoteCount < 10) {
          $(".note-limit-message").removeClass("active");
        }
      },
      error: (response) => {
        console.log(response);
      }
    });
  }

  updateNote(e) {
    const note = $(e.target).parents("li");
    let updatedPost = {
      'title': note.find(".note-title-field").val(),
      'content': note.find(".note-body-feild").val()
    }

    $.ajax({
      beforeSend: (xhr) => {
        xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
      },
      url: universityData.root_url + '/wp-json/wp/v2/note/' + note.data('id'),
      type: 'POST',
      data: updatedPost,
      success: (response) => {
        this.makeNoteReadOnly(note);
      },
      error: (response) => {
        console.log(response);
      }
    });
  }

  createNote() {
    let newPost = {
      'title': $(".new-note-title").val(),
      'content': $(".new-note-body").val(),
      'status': 'publish'
    }

    $.ajax({
      beforeSend: (xhr) => {
        xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
      },
      url: universityData.root_url + '/wp-json/wp/v2/note/',
      type: 'POST',
      data: newPost,
      success: (response) => {
        $(".new-note-title, .new-note-body").val('');
        $(`
        <li data-id="${response.id}">
          <input readonly class="note-title-field" type="text" value="${response.title.raw}">
          <span class="edit-note"><i class="fa fa-pencil" aria-hidden="true"></i>Edit</span>
          <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="true"></i>Delete</span>
          <textarea readonly class="note-body-field">${response.content.raw}</textarea>
          <span class="update-note btn btn--blue btn--small"><i class="fa fa-arrow-right" aria-hidden="true"></i>Save</span>
        </li>
        `).prependTo("#my-notes").hide().slideDown();
      },
      error: (response) => {
        if (response.responseText == "You have reached your note limit.") {
          $(".note-limit-message").addClass("active");
        }
      }
    });
  }
}

export default MyNotes;