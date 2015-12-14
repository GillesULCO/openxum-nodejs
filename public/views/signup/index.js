/* global app:true */

(function () {
    'use strict';

    app = app || {};

    var captcha = function ($) {
        $( function() {
            var captchaEl = $('#sample-captcha').visualCaptcha({
                imgPath: '/img/',
                captcha: {
                    numberOfImages: 5,
                    callbacks: {
                        loaded: function (captcha) {
                            // Avoid adding the hashtag to the URL when clicking/selecting visualCaptcha options
                            var anchorOptions = document.getElementById('sample-captcha').getElementsByTagName('a');
                            var anchorList = Array.prototype.slice.call(anchorOptions);// .getElementsByTagName does not return an actual array
                            anchorList.forEach(function (anchorItem) {
                                _bindClick(anchorItem, function (event) {
                                    event.preventDefault();
                                });
                            });
                        }
                    }
                }
            });
            var captcha = captchaEl.data('captcha');

            // Binds an element to callback on click
            // @param element object like document.getElementById() (has to be a single element)
            // @param callback function to run when the element is clicked
            var _bindClick = function (element, callback) {
                if (element.addEventListener) {
                    element.addEventListener('click', callback, false);
                } else {
                    element.attachEvent('onclick', callback);
                }
            };
        });
    };

    app.Signup = Backbone.Model.extend({
        url: '/signup/',
        defaults: {
            errors: [],
            errfor: {},
            username: '',
            email: '',
            password: '',
            captcha: ''
        }
    });

    app.SignupView = Backbone.View.extend({
        el: '#signup',
        template: _.template($('#tmpl-signup').html()),
        events: {
            'submit form': 'preventSubmit',
            'keypress [name="password"]': 'signupOnEnter',
            'click .btn-signup': 'signup'
        },
        initialize: function () {
            this.model = new app.Signup();
            this.listenTo(this.model, 'sync', this.render);
            this.render();
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            this.$el.find('[name="username"]').focus();
            captcha(jQuery);
        },
        preventSubmit: function (event) {
            event.preventDefault();
        },
        signupOnEnter: function (event) {
            if (event.keyCode !== 13) {
                return;
            }
            if ($(event.target).attr('name') !== 'password') {
                return;
            }
            event.preventDefault();
            this.signup();
        },
        signup: function () {
            this.$el.find('.btn-signup').attr('disabled', true);
            this.model.save({
                username: this.$el.find('[name="username"]').val(),
                email: this.$el.find('[name="email"]').val(),
                password: this.$el.find('[name="password"]').val(),
                captcha_image: this.$el.find('.imageField').val(),
                captcha_audio: this.$el.find('.audioField').val()
            }, {
                success: function (model, response) {
                    if (response.success) {
                        location.href = '/account/';
                    } else {
                        model.set(response);
                    }
                }
            });
        }
    });

    $(document).ready(function () {
        app.signupView = new app.SignupView();
    });
}());
