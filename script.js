$(document).ready(async function () {
  console.log("JavaScript is running!");

  // Tombol untuk buka register
  $("#go-to-register").click(function () {
    $("#landing-screen").addClass("d-none");
    $("#register-screen").removeClass("d-none");
  });

  // Tombol kembali ke login
  $("#back-to-login").click(function () {
    $("#register-screen").addClass("d-none");
    $("#landing-screen").removeClass("d-none");
  });

  // Submit form register
  $("#register-form").submit(function (e) {
    e.preventDefault();

    const profile = {
      name: $("#reg-name").val(),
      age: $("#reg-age").val(),
      gender: $("#reg-gender").val(),
      location: $("#reg-location").val(),
      description: $("#reg-description").val(),
      image: $("#reg-image").val(),
    };

    // Simpan user ke localStorage
    localStorage.setItem("currentUser", JSON.stringify(profile));

    alert("Register sukses! Sekarang kamu bisa login.");
    $("#register-screen").addClass("d-none");
    $("#landing-screen").removeClass("d-none");
  });

  // Ambil profil acak dari API
  let profiles = await generateProfiles(50);
  let matchedUsers = [];

  // ===============================
  // Menampilkan layar swipe profile
  // ===============================
  function showMatchingScreen() {
    $("#landing-screen").addClass("d-none");
    $("#matching-screen").removeClass("d-none");

    let container = $(".card-container");
    container.html("");

    for (let i = 0; i < 5; i++) {
      let profile = getNewProfile();
      if (profile) {
        let newCard = createCardElement(profile);
        container.append(newCard);
        addSwipeFunctionality(newCard);
      }
    }
  }

  // ===============================
  // Tombol kembali dari Chat ke swipe
  // ===============================
  $("#back-to-swipe").click(function () {
    $("#chat-screen").addClass("d-none");
    $("#matching-screen").removeClass("d-none");
  });

  // ===============================
  // Menambahkan kemampuan swipe pada kartu
  // ===============================
  function addSwipeFunctionality(card) {
    var hammer = new Hammer(card[0]);

    hammer.on("pan", function (event) {
      $(card).css({
        transform: `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${
          event.deltaX / 20
        }deg)`,
      });
    });

    hammer.on("panend", function (event) {
      var moveOutWidth = $(window).width();
      if (event.deltaX > 150) {
        swipeCard(card, moveOutWidth);
      } else if (event.deltaX < -150) {
        swipeCard(card, -moveOutWidth);
      } else {
        $(card).animate({ transform: "translate(0px, 0px) rotate(0deg)" }, 300);
      }
    });
  }

  // ===============================
  // Saat kartu di-swipe
  // ===============================
  function swipeCard(card, moveOutWidth) {
    $(card).animate(
      {
        transform: `translate(${moveOutWidth}px, 0px) rotate(${
          moveOutWidth > 0 ? 20 : -20
        }deg)`,
        opacity: 0,
      },
      300,
      function () {
        $(card).remove();

        let newProfile = getNewProfile();
        if (newProfile) {
          let newCard = createCardElement(newProfile);
          $(".card-container").prepend(newCard);
          addSwipeFunctionality(newCard);
        }

        // Hapus kartu kelebihan
        while ($(".card").length > 5) {
          $(".card").last().remove();
        }
      }
    );
  }

  // ===============================
  // Ambil profil baru dari daftar
  // ===============================
  function getNewProfile() {
    if (profiles.length === 0) {
      console.warn("No more profiles!");
      return null;
    }
    return profiles.shift();
  }

  // ===============================
  // Buat kartu HTML untuk satu profil
  // ===============================
  function createCardElement(profile) {
    return $(`
        <div class="card" style="background-image: url('${profile.image}');">
          <div class="d-none card-bg-blur" style="background-image: url('${profile.image}');"></div>
          <div class="card-info bg-light">
            <h3 class="fs-4 mb-1">${profile.name}, ${profile.age}</h3>
            <p class="fs-6 fw-light mb-1 d-none">Gender: ${profile.gender}</p>
            <p class="muted fs-6 fw-light mb-3">📍 ${profile.location}</p>
            <div class="d-flex justify-content-center flex-row">
              <button class="btn btn-danger btn-md m-1 chat-btn" data-name="${profile.name}" data-image="${profile.image}">Chat</button>
              <button class="btn btn-outline-danger btn-md m-1 like-btn" data-name="${profile.name}" data-image="${profile.image}">Like</button>
              <button class="btn btn-outline-danger btn-md m-1 gift-btn" data-name="${profile.name}" data-image="${profile.image}">Gift</button>
            </div>
            <small>You can only chat one time your sugarluv reply.</small>
            <p class="fs-6 mt-3 pt-3 border-top">${profile.description}</p>
          </div>
        </div>
      `);
  }

  // ===============================
  // Generate data profil dari API RandomUser
  // ===============================
  function generateProfiles(count) {
    const hobbies = [
      "hiking",
      "coffee tasting",
      "traveling",
      "deep conversations",
      "playing guitar",
      "photography",
      "watching anime",
      "coding side projects",
    ];

    function getRandomHobby() {
      return hobbies[Math.floor(Math.random() * hobbies.length)];
    }

    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://randomuser.me/api/?results=${count}`,
        dataType: "json",
        success: function (data) {
          const profiles = data.results.map((user) => ({
            name: `${user.name.first} ${user.name.last}`,
            age: user.dob.age,
            gender: user.gender,
            description: `${user.name.first} enjoys ${getRandomHobby()}.`,
            image: user.picture.large,
            location: `${user.location.city}, ${user.location.state}, ${user.location.country}`,
          }));
          resolve(profiles);
        },
        error: function (xhr, status, error) {
          console.error("Failed to fetch random user data:", error);
          resolve([]);
        },
      });
    });
  }

  // ===============================
  // Buka layar chat saat klik tombol Chat
  // ===============================
  $(document).on("click", ".chat-btn", function () {
    let name = $(this).data("name");
    let image = $(this).data("image");

    $("#chat-screen").removeClass("d-none");
    $("#chat-name").text(name);
    $("#chat-avatar").attr("src", image);
  });

  // ===============================
  // Kirim pesan di layar chat
  // ===============================
  $("#send-message").click(function () {
    let message = $("#chat-input").val();
    if (message.trim() !== "") {
      $("#chat-messages").append(`<p><strong>You:</strong> ${message}</p>`);
      $("#chat-input").val("");
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    }
  });

// ===============================
// Animasi hati melayang saat Like
// ===============================
$(document).on("click", ".like-btn", function (e) {
    const offset = $(this).offset();
    const buttonWidth = $(this).outerWidth();
    const buttonHeight = $(this).outerHeight();
  
    const heart = $(
      `<div class="floating-heart"><i class="fas fa-heart"></i></div>`
    );
    $(".like-btn").append(heart);   

  
    // Hapus setelah animasi selesai
    setTimeout(() => {
      heart.remove();
    }, 1000);
  });
  

  // profile wallet
  $("#profile-form").submit(function (e) {
    e.preventDefault();

    const profile = {
      name: $("#username").val(),
      bio: $("#bio").val(),
      image: $("#profile-image").val(),
      wallet: localStorage.getItem("walletAddress") || null,
    };

    if (!profile.wallet) {
      alert("Please connect your wallet first.");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(profile));

    showMatchingScreen();
    $("#register-screen").addClass("d-none");
    $("#landing-screen").addClass("d-none");
  });
});
