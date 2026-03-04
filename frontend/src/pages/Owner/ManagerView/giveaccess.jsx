import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

export default function GiveAccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.manager || {};
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = () => {
    const templateParams = {
      to_name: formData?.name,
      to_email: formData?.email,
      role: formData?.role,
      factory: formData?.factory,
      password: formData?.password, // ensure password is included in formData
    };

    emailjs.send(
      'service_greenleaf',      // replace with your EmailJS SERVICE_ID
      'template_unor4tz',     // replace with your EmailJS TEMPLATE_ID
      templateParams,
      'CErGd8kS6Lk5ik7fg'       // replace with your EmailJS PUBLIC_KEY
    )
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
      setEmailSent(true);
    })
    .catch((error) => {
      console.error('Email sending failed:', error);
      alert('Failed to send email. Please try again.');
    });
  };

  const handleAddNew = () => {
    navigate('/owner/managers');
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-white/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Manager Created</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-gray-700 text-base mb-2">
            The manager account has been created successfully.<br />
            Please review the details below and assign system access and permissions.<br />
            {emailSent ? (
              <span className="text-green-600 font-medium">A welcome email has been sent to the manager.</span>
            ) : (
              <span className="text-gray-500">You can also send a welcome email with login instructions.</span>
            )}
          </div>
          <div className="bg-gray-50 rounded p-4 border border-gray-200 space-y-1">
            <div className="font-semibold text-gray-800 mb-2">Manager Details</div>
            <div className="text-sm text-gray-700"><b>Name:</b> {formData?.name}</div>
            <div className="text-sm text-gray-700"><b>NIC:</b> {formData?.nic}</div>
            <div className="text-sm text-gray-700"><b>Mobile:</b> {formData?.mobile}</div>
            <div className="text-sm text-gray-700"><b>Email:</b> {formData?.email}</div>
            <div className="text-sm text-gray-700"><b>Password:</b> {formData?.password}</div>
            <div className="text-sm text-gray-700"><b>Role:</b> {formData?.role}</div>
            <div className="text-sm text-gray-700"><b>Factory:</b> {formData?.factory}</div>
          </div>
          <div className="space-y-4">
            <button
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-2 rounded-lg font-medium transition-colors"
              onClick={handleSendEmail}
              disabled={emailSent}
            >
              {emailSent ? 'Email Sent' : 'Send Welcome Email'}
            </button>
            <button 
              className="w-full bg-green-200 hover:bg-green-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
              onClick={handleAddNew}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
