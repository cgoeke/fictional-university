<?php 
  require get_theme_file_path('/includes/search-route.php');
  require get_theme_file_path('/includes/like-route.php');

  function university_custom_rest() {
    register_rest_field('post', 'authorName', array(
      'get_callback' => function() {
        return get_the_author();
      }
    ));

    register_rest_field('note', 'userNoteCount', array(
      'get_callback' => function() {
        return count_user_posts(get_current_user_id(), 'note');
      }
    ));
  }

  add_action('rest_api_init', 'university_custom_rest');

  function pageBanner($args = NULL) {
    if (isset($args['title'])) {
      $args['title'] = $args['title'];
    } else {
      $args['title'] = get_the_title();
    }
    if (isset($args['subtitle'])) {
      $args['subtitle'] = $args['subtitle'];
    } else {
      $args['subtitle'] = get_field('page_banner_subtitle');
    }
    if (isset($args['photo'])) {
      $args['photo'] = $args['photo'];
    } else {
      if (get_field('page_banner_background_image')) {
        $args['photo'] = get_field('page_banner_background_image')['sizes']['pageBanner'];
      } else {
        $args['photo'] = get_theme_file_uri('/images/ocean.jpg');
      }
    }
  ?>
    <div class="page-banner">
      <div class="page-banner__bg-image" style="background-image: url(<?php 
        echo $args['photo']; ?>)">
      </div>
      <div class="page-banner__content container container--narrow">
        <h1 class="page-banner__title"><?php echo $args['title']; ?></h1>
        <div class="page-banner__intro">
          <p><?php echo $args['subtitle']; ?></p>
        </div>
      </div>  
    </div>
  <?php }

  function university_files() {
    wp_enqueue_script('googleMap', '//maps.googleapis.com/maps/api/js?key=AIzaSyATIt5sTyKxq3Rvw9uSqaqzx_jEv_7jbbM', NULL, '1.0', true);
    wp_enqueue_script('main_scripts', get_theme_file_uri('/js/scripts-bundled.js'), NULL, '1.0', true);
    wp_enqueue_style('custom-google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
    wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
    wp_enqueue_style('main_styles', get_stylesheet_uri());
    wp_localize_script( 'main_scripts', 'universityData', array(
      'root_url' => get_site_url(),
      'nonce' => wp_create_nonce('wp_rest')
    ));
  }

  add_action( 'wp_enqueue_scripts', 'university_files' );

  function university_features() {
    register_nav_menu( 'headerNavMenu', 'Header Navigation Menu' );
    register_nav_menu( 'footerMenu1', 'Footer Menu 1' );
    register_nav_menu( 'footerMenu2', 'Footer Menu 2' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_image_size( 'professorLandscape', 400, 260, true );
    add_image_size( 'professorPortrait', 480, 650, true );
    add_image_size( 'pageBanner', 1500, 350, true );
  }

  add_action( 'after_setup_theme', 'university_features' );

  function university_adjust_queries($query) {
    if (!is_admin() AND is_post_type_archive('campus') AND $query->is_main_query()) {
      $query->set('posts_per_page', -1); 
    }

    if (!is_admin() AND is_post_type_archive('program') AND $query->is_main_query()) {
      $query->set('order_by', 'title');
      $query->set('order', 'ASC');
      $query->set('posts_per_page', -1); 
    }

    if (!is_admin() AND is_post_type_archive('event') AND $query->is_main_query()) {
      $today = date('Ymd');
      $query->set('meta_key', 'event_date');
      $query->set('order_by', 'meta_value_num');
      $query->set('order', 'ASC');
      $query->set('meta_query', array(
        array(
          'key' => 'event_date',
          'compare' => '>=',
          'value' => $today,
          'type' => numeric
        ))
      );
    }
  }

  add_action( 'pre_get_posts', 'university_adjust_queries' );

  function universityMapKey($api) {
    $api['key'] = 'AIzaSyATIt5sTyKxq3Rvw9uSqaqzx_jEv_7jbbM';
    return $api;
  }

  add_filter('acf/fields/google_map/api', 'universityMapKey');

// Redirect subscriber accounts to homepage
  function redirectSubsToHomepage() {
    $currentUser = wp_get_current_user();

    if (count($currentUser->roles) == 1 AND $currentUser->roles[0] == 'subscriber' ) {
      wp_redirect(site_url('/'));
      exit;
    }
  }
  add_action('admin_init', 'redirectSubsToHomepage');
  

  function removesAdminBar() {
    $currentUser = wp_get_current_user();

    if (count($currentUser->roles) == 1 AND $currentUser->roles[0] == 'subscriber' ) {
      show_admin_bar(false); 
    }
  }

  add_action('wp_loaded', 'removesAdminBar');

// Customize login screen
  function ourHeaderUrl() {
    return esc_url(site_url('/'));
  }

  add_filter('login_headerurl', 'ourHeaderUrl');

  function ourLoginCSS() {
    wp_enqueue_style('main_styles', get_stylesheet_uri());
    wp_enqueue_style('custom-google-fonts', '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i');
  }

  add_action('login_enqueue_scripts', 'ourLoginCSS');

  function ourLoginTitle() {
    return get_bloginfo('name'); 
  }

  add_filter('login_headertitle', 'ourLoginTitle');

  // Force note posts to be private
  function makeNotePrivate($data, $postarr) {
    if ($data['post_type'] == 'note') {
      if (count_user_posts(get_current_user_id(), 'note') > 9 AND !$postarr['ID']) {
        die("You have reached your note limit.");
      } 

      $data['post_content'] = sanitize_textarea_field($data['post_content']);
      $data['post_title'] = sanitize_text_field($data['post_title']);
    }

    if ($data['post_type'] == 'note' AND $data['post_status'] != 'trash') {
      $data['post_status'] = "private";
    }
    return $data;
  }

  add_filter('wp_insert_post_data', 'makeNotePrivate', 10, 2);